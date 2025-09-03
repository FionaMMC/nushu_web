import { Request, Response } from 'express';
import { GalleryImage, IGalleryImage } from '../models/Gallery.js';
import { uploadToS3, deleteFromS3, generateThumbnail } from '../config/storage.js';
import { Types } from 'mongoose';

// Interface for request body validation
interface CreateGalleryImageRequest {
  title: string;
  description?: string;
  alt: string;
  category?: string;
  priority?: number;
}

interface UpdateGalleryImageRequest extends Partial<CreateGalleryImageRequest> {
  isActive?: boolean;
}

// Get all gallery images
export const getAllImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      limit = '20', 
      page = '1',
      sort = 'recent',
      featured 
    } = req.query;
    
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNumber - 1) * limitNumber;
    
    let query: any = { isActive: true };
    let sortQuery: any;
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter featured images
    if (featured === 'true') {
      query.priority = { $gte: 50 };
    }
    
    // Set sort order
    switch (sort) {
      case 'priority':
        sortQuery = { priority: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'title':
        sortQuery = { title: 1 };
        break;
      default: // 'recent'
        sortQuery = { createdAt: -1 };
    }
    
    const [images, total] = await Promise.all([
      GalleryImage.find(query)
        .sort(sortQuery)
        .limit(limitNumber)
        .skip(skip)
        .lean(),
      GalleryImage.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        images,
        pagination: {
          current: pageNumber,
          total: Math.ceil(total / limitNumber),
          limit: limitNumber,
          count: images.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get images by category
export const getImagesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const { limit = '20' } = req.query;
    
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string)));
    
    let query: any = { isActive: true };
    if (category !== 'all') {
      query.category = category;
    }
    
    const images = await GalleryImage.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limitNumber)
      .lean();
    
    res.status(200).json({
      success: true,
      data: { images, category }
    });
  } catch (error) {
    console.error('Error fetching images by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images by category',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single image by ID
export const getImageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
      return;
    }
    
    const image = await GalleryImage.findOne({ _id: id, isActive: true });
    
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: { image }
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Upload and create new gallery image (admin only)
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    const { title, description, alt, category = 'general', priority = 0 } = req.body;
    
    if (!title || !alt) {
      res.status(400).json({
        success: false,
        message: 'Title and alt text are required'
      });
      return;
    }
    
    // Upload to S3
    const { url: imageUrl, key: s3Key } = await uploadToS3(req.file, 'gallery');
    const thumbnailUrl = generateThumbnail(imageUrl);
    
    // Create gallery image record
    const galleryImage = new GalleryImage({
      title,
      description,
      imageUrl,
      thumbnailUrl,
      alt,
      category,
      s3Key,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      priority: parseInt(priority) || 0
    });
    
    const savedImage = await galleryImage.save();
    
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image: savedImage }
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    // Clean up uploaded file if database save fails
    if (req.body.s3Key) {
      try {
        await deleteFromS3(req.body.s3Key);
      } catch (deleteError) {
        console.error('Error cleaning up failed upload:', deleteError);
      }
    }
    
    if (error?.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update image metadata (admin only)
export const updateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateGalleryImageRequest = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
      return;
    }
    
    const image = await GalleryImage.findOneAndUpdate(
      { _id: id, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: { image }
    });
  } catch (error: any) {
    console.error('Error updating image:', error);
    
    if (error?.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete image (admin only)
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
      return;
    }
    
    const image = await GalleryImage.findOne({ _id: id, isActive: true });
    
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
      return;
    }
    
    if (permanent === 'true') {
      // Permanently delete from database and S3
      try {
        await deleteFromS3(image.s3Key);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue with database deletion even if S3 fails
      }
      
      await GalleryImage.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: 'Image permanently deleted'
      });
    } else {
      // Soft delete (set isActive to false)
      image.isActive = false;
      await image.save();
      
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get available categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await GalleryImage.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: { categories: categories.sort() }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get gallery statistics (admin only)
export const getGalleryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalImages,
      activeImages,
      categoryStats,
      totalFileSize
    ] = await Promise.all([
      GalleryImage.countDocuments(),
      GalleryImage.countDocuments({ isActive: true }),
      GalleryImage.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      GalleryImage.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ])
    ]);
    
    const stats = {
      totalImages,
      activeImages,
      categoryBreakdown: categoryStats,
      totalFileSize: totalFileSize[0]?.totalSize || 0,
      formattedFileSize: formatFileSize(totalFileSize[0]?.totalSize || 0)
    };
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Bulk operations (admin only)
export const bulkUpdateImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageIds, updates } = req.body;
    
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Image IDs array is required'
      });
      return;
    }
    
    // Validate all IDs
    const invalidIds = imageIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid image IDs: ${invalidIds.join(', ')}`
      });
      return;
    }
    
    const result = await GalleryImage.updateMany(
      { _id: { $in: imageIds }, isActive: true },
      { ...updates, updatedAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} images updated successfully`,
      data: { 
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error bulk updating images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update images',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
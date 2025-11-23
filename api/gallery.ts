import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { put, del, list } from '@vercel/blob';
import jwt from 'jsonwebtoken';

// Gallery model definition (inline to avoid import issues)
interface IGalleryImage extends mongoose.Document {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  alt: string;
  category?: string;
  eventId?: string;
  blobUrl: string;
  pathname: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new mongoose.Schema<IGalleryImage>({
  title: {
    type: String,
    required: [true, 'Image title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  alt: {
    type: String,
    required: [true, 'Alt text is required for accessibility'],
    trim: true,
    maxlength: [300, 'Alt text cannot exceed 300 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
    enum: ['workshop', 'calligraphy', 'events', 'community', 'historical', 'artwork', 'general'],
    default: 'general'
  },
  eventId: {
    type: String,
    trim: true
  },
  blobUrl: {
    type: String,
    required: [true, 'Blob URL is required'],
    trim: true
  },
  pathname: {
    type: String,
    required: [true, 'Pathname is required for file management'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
    max: [10 * 1024 * 1024, 'File size cannot exceed 10MB']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  width: {
    type: Number,
    min: [1, 'Width must be positive']
  },
  height: {
    type: Number,
    min: [1, 'Height must be positive']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: [-100, 'Priority cannot be less than -100'],
    max: [100, 'Priority cannot exceed 100']
  }
}, {
  timestamps: true,
  versionKey: false
});

const GalleryImage = mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);

// Database connection helper
let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Database connected (gallery)');
  } catch (error) {
    console.error('❌ Database connection failed (gallery):', error);
    throw error;
  }
};

// JWT verification function
function verifyToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    const { method, query } = req;
    const imageId = query.imageId as string;

    switch (method) {
      case 'GET':
        // Get all images with filters
        const {
          category,
          eventId,
          limit = '50',
          page = '1'
        } = query;

        const filters: any = { isActive: true };
        if (category && category !== 'all') {
          filters.category = category;
        }
        if (eventId) {
          filters.eventId = eventId;
        }

        const limitNum = Math.min(parseInt(limit as string) || 50, 100);
        const pageNum = parseInt(page as string) || 1;
        const skip = (pageNum - 1) * limitNum;

        const [images, total] = await Promise.all([
          GalleryImage.find(filters)
            .sort({ priority: -1, createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .lean(),
          GalleryImage.countDocuments(filters)
        ]);

        return res.json({
          success: true,
          data: {
            images,
            pagination: {
              current: pageNum,
              total: Math.ceil(total / limitNum),
              limit: limitNum,
              count: images.length,
              totalRecords: total
            }
          }
        });

      case 'POST':
        // Save image metadata (admin only)
        // Note: Image should be uploaded to /api/gallery/upload first
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }

        try {
          const token = authHeader.substring(7);
          verifyToken(token);
          console.log('POST /gallery - Token verified successfully');
        } catch (tokenError) {
          console.log('POST /gallery - Token verification failed:', String(tokenError));
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          console.log('=== POST /gallery - Start ===');
          console.log('Request body:', req.body);

          const { title, description, alt, category, priority, imageUrl, pathname, fileSize, mimeType } = req.body;

          if (!title || !alt || !imageUrl || !pathname) {
            return res.status(400).json({
              success: false,
              message: 'Missing required fields: title, alt, imageUrl, and pathname are required'
            });
          }

          // Create gallery image record
          const newImage = new GalleryImage({
            title: title.trim(),
            description: description?.trim() || '',
            imageUrl,
            thumbnailUrl: imageUrl, // Use same URL for thumbnail
            alt: alt.trim(),
            category: category || 'general',
            blobUrl: imageUrl,
            pathname,
            fileSize: fileSize || 0,
            mimeType: mimeType || 'image/jpeg',
            priority: priority !== undefined ? Number(priority) : 0,
            isActive: true
          });

          await newImage.save();
          console.log('Gallery image saved:', newImage._id);

          return res.status(201).json({
            success: true,
            data: { image: newImage },
            message: 'Image saved successfully'
          });
        } catch (saveError) {
          console.error('POST /gallery - Save error:', saveError);
          return res.status(500).json({
            success: false,
            message: 'Failed to save image',
            error: process.env.NODE_ENV === 'development' ? String(saveError) : undefined
          });
        }

      case 'DELETE':
        // Delete image (admin only)
        if (!imageId) {
          return res.status(400).json({ success: false, message: 'Image ID required' });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }

        try {
          const token = authHeaderDelete.substring(7);
          verifyToken(token);
          console.log('DELETE /gallery - Token verified successfully');
        } catch (tokenError) {
          console.log('DELETE /gallery - Token verification failed:', String(tokenError));
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          const image = await GalleryImage.findById(imageId);

          if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
          }

          // Delete from Vercel Blob
          console.log('Deleting from Vercel Blob:', image.blobUrl);
          try {
            await del(image.blobUrl);
            console.log('Blob deleted successfully');
          } catch (blobError) {
            console.error('Failed to delete blob:', blobError);
            // Continue even if blob deletion fails
          }

          // Delete from database
          await GalleryImage.findByIdAndDelete(imageId);
          console.log('Gallery image deleted from database');

          return res.json({
            success: true,
            message: 'Image deleted successfully'
          });
        } catch (deleteError) {
          console.error('DELETE /gallery - Error:', deleteError);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: process.env.NODE_ENV === 'development' ? String(deleteError) : undefined
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Gallery API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export default handler;

// Vercel configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

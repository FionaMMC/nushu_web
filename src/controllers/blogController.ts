import { Request, Response } from 'express';
import BlogPost from '../models/Blog.js';
import { Types } from 'mongoose';

// Get all blog posts
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      eventId,
      published = 'true',
      limit = '20',
      page = '1',
      sort = 'recent'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNumber - 1) * limitNumber;

    let query: any = {};
    let sortQuery: any;

    // Filter by published status
    if (published === 'true') {
      query.isPublished = true;
    } else if (published !== 'all') {
      query.isPublished = false;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by event
    if (eventId) {
      query.eventId = eventId;
    }

    // Set sort order
    switch (sort) {
      case 'priority':
        sortQuery = { priority: -1, date: -1 };
        break;
      case 'oldest':
        sortQuery = { date: 1 };
        break;
      case 'recent':
      default:
        sortQuery = { date: -1, priority: -1 };
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort(sortQuery)
        .limit(limitNumber)
        .skip(skip)
        .lean(),
      BlogPost.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          current: pageNumber,
          total: Math.ceil(total / limitNumber),
          limit: limitNumber,
          count: posts.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single blog post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid blog post ID'
      });
      return;
    }

    const post = await BlogPost.findById(id).lean();

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create new blog post (admin only)
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      date,
      content,
      excerpt,
      imageUrl,
      thumbnailUrl,
      imageBlobUrl,
      imagePathname,
      imageAlt,
      category,
      tags,
      eventId,
      isPublished,
      priority
    } = req.body;

    // Validation
    if (!title || !author || !content) {
      res.status(400).json({
        success: false,
        message: 'Title, author, and content are required'
      });
      return;
    }

    const postData = {
      title: title.trim(),
      author: author.trim(),
      date: date ? new Date(date) : new Date(),
      content: content.trim(),
      excerpt: excerpt?.trim(),
      imageUrl,
      thumbnailUrl,
      imageBlobUrl,
      imagePathname,
      imageAlt,
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      eventId: eventId || undefined,
      isPublished: isPublished !== undefined ? isPublished : true,
      priority: priority !== undefined ? Number(priority) : 0
    };

    const post = await BlogPost.create(postData);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { post }
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);

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
      message: 'Failed to create blog post',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update blog post (admin only)
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid blog post ID'
      });
      return;
    }

    const post = await BlogPost.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: { post }
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);

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
      message: 'Failed to update blog post',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete blog post (admin only)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid blog post ID'
      });
      return;
    }

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

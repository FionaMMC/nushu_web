import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { del } from '@vercel/blob';
import jwt from 'jsonwebtoken';

// Blog model definition (inline to avoid import issues)
interface IBlogPost extends mongoose.Document {
  title: string;
  author: string;
  date: Date;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  imageBlobUrl?: string;
  imagePathname?: string;
  imageAlt?: string;
  category?: string;
  tags?: string[];
  eventId?: string;
  isPublished: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new mongoose.Schema<IBlogPost>({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Blog date is required'],
    default: Date.now
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  imageBlobUrl: {
    type: String,
    trim: true
  },
  imagePathname: {
    type: String,
    trim: true
  },
  imageAlt: {
    type: String,
    trim: true,
    maxlength: [300, 'Image alt text cannot exceed 300 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
    enum: ['culture', 'workshop', 'history', 'news', 'community', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  eventId: {
    type: String,
    trim: true
  },
  isPublished: {
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

// Index for efficient querying
BlogPostSchema.index({ date: -1, priority: -1 });
BlogPostSchema.index({ isPublished: 1, date: -1 });
BlogPostSchema.index({ category: 1, date: -1 });

const BlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

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
    console.log('✅ Database connected (blog)');
  } catch (error) {
    console.error('❌ Database connection failed (blog):', error);
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
    const blogId = query.blogId as string;

    switch (method) {
      case 'GET':
        // Get all blog posts or a single post
        if (blogId) {
          // Get single blog post
          const post = await BlogPost.findById(blogId);

          if (!post) {
            return res.status(404).json({
              success: false,
              message: 'Blog post not found'
            });
          }

          return res.json({
            success: true,
            data: { post }
          });
        } else {
          // Get all blog posts with filters
          const {
            category,
            eventId,
            published = 'true',
            limit = '50',
            page = '1'
          } = query;

          const filters: any = {};

          // Only show published posts for public access
          if (published === 'true') {
            filters.isPublished = true;
          } else if (published === 'all') {
            // Admin can see all posts, but requires authentication
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              filters.isPublished = true; // Default to published only
            } else {
              try {
                const token = authHeader.substring(7);
                verifyToken(token);
                // Token valid, can see all posts
              } catch (error) {
                filters.isPublished = true; // Invalid token, show published only
              }
            }
          }

          if (category && category !== 'all') {
            filters.category = category;
          }
          if (eventId) {
            filters.eventId = eventId;
          }

          const limitNum = Math.min(parseInt(limit as string) || 50, 100);
          const pageNum = parseInt(page as string) || 1;
          const skip = (pageNum - 1) * limitNum;

          const [posts, total] = await Promise.all([
            BlogPost.find(filters)
              .sort({ priority: -1, date: -1 })
              .limit(limitNum)
              .skip(skip)
              .lean(),
            BlogPost.countDocuments(filters)
          ]);

          return res.json({
            success: true,
            data: {
              posts,
              pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                limit: limitNum,
                count: posts.length,
                totalRecords: total
              }
            }
          });
        }

      case 'POST':
        // Create new blog post (admin only)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Missing token'
          });
        }

        try {
          const token = authHeader.substring(7);
          verifyToken(token);
          console.log('POST /blog - Token verified successfully');
        } catch (tokenError) {
          console.log('POST /blog - Token verification failed:', String(tokenError));
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid token'
          });
        }

        try {
          console.log('=== POST /blog - Start ===');
          console.log('Request body:', req.body);

          const {
            title,
            author,
            date,
            content,
            excerpt,
            imageUrl,
            imagePathname,
            imageAlt,
            category,
            tags,
            isPublished,
            priority
          } = req.body;

          if (!title || !author || !content) {
            return res.status(400).json({
              success: false,
              message: 'Missing required fields: title, author, and content are required'
            });
          }

          // Create blog post record
          const newPost = new BlogPost({
            title: title.trim(),
            author: author.trim(),
            date: date ? new Date(date) : new Date(),
            content: content.trim(),
            excerpt: excerpt?.trim() || '',
            imageUrl: imageUrl || '',
            thumbnailUrl: imageUrl || '',
            imageBlobUrl: imageUrl || '',
            imagePathname: imagePathname || '',
            imageAlt: imageAlt?.trim() || '',
            category: category || 'general',
            tags: tags || [],
            isPublished: isPublished !== undefined ? isPublished : true,
            priority: priority !== undefined ? Number(priority) : 0
          });

          await newPost.save();
          console.log('Blog post saved:', newPost._id);

          return res.status(201).json({
            success: true,
            data: { post: newPost },
            message: 'Blog post created successfully'
          });
        } catch (saveError) {
          console.error('POST /blog - Save error:', saveError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create blog post',
            error: process.env.NODE_ENV === 'development' ? String(saveError) : undefined
          });
        }

      case 'PUT':
        // Update blog post (admin only)
        if (!blogId) {
          return res.status(400).json({
            success: false,
            message: 'Blog ID required'
          });
        }

        const authHeaderPut = req.headers.authorization;
        if (!authHeaderPut || !authHeaderPut.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Missing token'
          });
        }

        try {
          const token = authHeaderPut.substring(7);
          verifyToken(token);
          console.log('PUT /blog - Token verified successfully');
        } catch (tokenError) {
          console.log('PUT /blog - Token verification failed:', String(tokenError));
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid token'
          });
        }

        try {
          const updateData = req.body;

          // Remove fields that shouldn't be updated directly
          delete updateData._id;
          delete updateData.createdAt;
          delete updateData.updatedAt;

          const updatedPost = await BlogPost.findByIdAndUpdate(
            blogId,
            { $set: updateData },
            { new: true, runValidators: true }
          );

          if (!updatedPost) {
            return res.status(404).json({
              success: false,
              message: 'Blog post not found'
            });
          }

          return res.json({
            success: true,
            data: { post: updatedPost },
            message: 'Blog post updated successfully'
          });
        } catch (updateError) {
          console.error('PUT /blog - Update error:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update blog post',
            error: process.env.NODE_ENV === 'development' ? String(updateError) : undefined
          });
        }

      case 'DELETE':
        // Delete blog post (admin only)
        if (!blogId) {
          return res.status(400).json({
            success: false,
            message: 'Blog ID required'
          });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Missing token'
          });
        }

        try {
          const token = authHeaderDelete.substring(7);
          verifyToken(token);
          console.log('DELETE /blog - Token verified successfully');
        } catch (tokenError) {
          console.log('DELETE /blog - Token verification failed:', String(tokenError));
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Invalid token'
          });
        }

        try {
          const post = await BlogPost.findById(blogId);

          if (!post) {
            return res.status(404).json({
              success: false,
              message: 'Blog post not found'
            });
          }

          // Delete image from Vercel Blob if exists
          if (post.imageBlobUrl) {
            console.log('Deleting image from Vercel Blob:', post.imageBlobUrl);
            try {
              await del(post.imageBlobUrl);
              console.log('Blob deleted successfully');
            } catch (blobError) {
              console.error('Failed to delete blob:', blobError);
              // Continue even if blob deletion fails
            }
          }

          // Delete from database
          await BlogPost.findByIdAndDelete(blogId);
          console.log('Blog post deleted from database');

          return res.json({
            success: true,
            message: 'Blog post deleted successfully'
          });
        } catch (deleteError) {
          console.error('DELETE /blog - Error:', deleteError);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete blog post',
            error: process.env.NODE_ENV === 'development' ? String(deleteError) : undefined
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Blog API Error:', error);
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

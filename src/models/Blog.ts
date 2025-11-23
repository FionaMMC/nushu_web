import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  id: string;
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

const BlogPostSchema = new Schema<IBlogPost>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for efficient querying
BlogPostSchema.index({ date: -1, priority: -1 });
BlogPostSchema.index({ isPublished: 1, date: -1 });
BlogPostSchema.index({ category: 1, date: -1 });

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

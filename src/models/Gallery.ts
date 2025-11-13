import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryImage extends Document {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  alt: string;
  category?: string;
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

const GalleryImageSchema = new Schema<IGalleryImage>({
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
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail URL must be a valid URL'
    }
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
    enum: {
      values: ['workshop', 'calligraphy', 'events', 'community', 'historical', 'artwork', 'general'],
      message: 'Invalid category'
    },
    default: 'general'
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
    enum: {
      values: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      message: 'Invalid file type'
    }
  },
  width: {
    type: Number,
    min: [1, 'Width must be positive'],
    max: [10000, 'Width cannot exceed 10000px']
  },
  height: {
    type: Number,
    min: [1, 'Height must be positive'],
    max: [10000, 'Height cannot exceed 10000px']
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

// Indexes for better query performance
GalleryImageSchema.index({ category: 1, isActive: 1, priority: -1 });
GalleryImageSchema.index({ isActive: 1, createdAt: -1 });
GalleryImageSchema.index({ priority: -1, createdAt: -1 });

// Virtual for image aspect ratio
GalleryImageSchema.virtual('aspectRatio').get(function(this: IGalleryImage) {
  if (this.width && this.height) {
    return (this.width / this.height).toFixed(2);
  }
  return null;
});

// Virtual for file size in human readable format
GalleryImageSchema.virtual('formattedFileSize').get(function(this: IGalleryImage) {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if image is high priority
GalleryImageSchema.methods.isHighPriority = function(this: IGalleryImage): boolean {
  return this.priority > 50;
};

// Static method to get images by category
GalleryImageSchema.statics.getByCategory = function(category?: string) {
  const query: any = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }
  
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Static method to get recent images
GalleryImageSchema.statics.getRecent = function(limit: number = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get featured images (high priority)
GalleryImageSchema.statics.getFeatured = function() {
  return this.find({ 
    isActive: true, 
    priority: { $gte: 50 } 
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get available categories
GalleryImageSchema.statics.getCategories = function() {
  return this.distinct('category', { isActive: true });
};

export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
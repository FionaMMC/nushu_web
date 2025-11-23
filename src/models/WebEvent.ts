import mongoose, { Document, Schema } from 'mongoose';

export interface IWebEvent extends Document {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'current' | 'past';
  registrationLink?: string;
  posterImageUrl?: string;
  posterBlobUrl?: string;
  posterPathname?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  priority: number;
}

const WebEventSchema = new Schema<IWebEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  date: {
    type: String,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [500, 'Venue cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  blurb: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['current', 'past'],
    default: 'current',
    required: true
  },
  registrationLink: {
    type: String,
    trim: true,
    default: ''
  },
  posterImageUrl: {
    type: String,
    trim: true
  },
  posterBlobUrl: {
    type: String,
    trim: true
  },
  posterPathname: {
    type: String,
    trim: true
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
WebEventSchema.index({ date: 1, status: 1 });
WebEventSchema.index({ status: 1, priority: -1, date: -1 });
WebEventSchema.index({ tags: 1 });
WebEventSchema.index({ isActive: 1 });

// Virtual for formatted date display
WebEventSchema.virtual('formattedDate').get(function(this: IWebEvent) {
  try {
    return new Date(this.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return this.date;
  }
});

// Static method to get current events
WebEventSchema.statics.getCurrent = function() {
  return this.find({
    status: 'current',
    isActive: true
  }).sort({ date: -1, priority: -1 });
};

// Static method to get all events (sorted by date descending)
WebEventSchema.statics.getAll = function() {
  return this.find({
    isActive: true
  }).sort({ date: -1, priority: -1 });
};

// Static method to get events by status
WebEventSchema.statics.getByStatus = function(status: string) {
  return this.find({ status, isActive: true }).sort({ date: -1, priority: -1 });
};

export const WebEvent = mongoose.model<IWebEvent>('WebEvent', WebEventSchema);

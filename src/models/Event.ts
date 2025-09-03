import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationLink?: string;
  capacity?: number;
  currentRegistrations?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  priority: number;
}

const EventSchema = new Schema<IEvent>({
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
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
    required: true
  },
  registrationLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Registration link must be a valid URL'
    }
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1'],
    max: [1000, 'Capacity cannot exceed 1000']
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: [0, 'Current registrations cannot be negative'],
    validate: {
      validator: function(this: IEvent, v: number) {
        return !this.capacity || v <= this.capacity;
      },
      message: 'Current registrations cannot exceed capacity'
    }
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
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ status: 1, priority: -1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ isActive: 1 });

// Pre-save middleware to auto-update status based on date
EventSchema.pre('save', function(this: IEvent, next) {
  const today = new Date().toISOString().split('T')[0];
  const eventDate = this.date;
  
  if (eventDate < today && this.status === 'upcoming') {
    this.status = 'completed';
  }
  
  next();
});

// Virtual for formatted date display
EventSchema.virtual('formattedDate').get(function(this: IEvent) {
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

// Method to check if event is near capacity
EventSchema.methods.isNearCapacity = function(this: IEvent): boolean {
  if (!this.capacity || !this.currentRegistrations) return false;
  return (this.currentRegistrations / this.capacity) > 0.8;
};

// Static method to get upcoming events
EventSchema.statics.getUpcoming = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    status: 'upcoming',
    date: { $gte: today },
    isActive: true
  }).sort({ date: 1, priority: -1 });
};

// Static method to get events by status
EventSchema.statics.getByStatus = function(status: string) {
  return this.find({ status, isActive: true }).sort({ date: -1, priority: -1 });
};

export const Event = mongoose.model<IEvent>('Event', EventSchema);
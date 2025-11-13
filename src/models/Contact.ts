import mongoose from 'mongoose';

export interface IContact {
  _id: string;
  name: string;
  email: string;
  message: string;
  interestedEvent?: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  response?: string;
}

const contactSchema = new mongoose.Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxLength: [2000, 'Message cannot exceed 2000 characters']
  },
  interestedEvent: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded', 'archived'],
    default: 'new'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  respondedAt: {
    type: Date
  },
  response: {
    type: String,
    trim: true,
    maxLength: [2000, 'Response cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

// Virtual for time since creation
contactSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Static methods for common queries
contactSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

contactSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ status: 'new' });
};

contactSchema.statics.markAsRead = function(contactId: string) {
  return this.findByIdAndUpdate(
    contactId, 
    { status: 'read' }, 
    { new: true }
  );
};

contactSchema.statics.addResponse = function(contactId: string, response: string) {
  return this.findByIdAndUpdate(
    contactId,
    { 
      response,
      respondedAt: new Date(),
      status: 'responded'
    },
    { new: true }
  );
};

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
export default Contact;
import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  eventId: {
    type: String,
    required: [true, 'Event ID is required'],
    ref: 'Event'
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
RegistrationSchema.index({ eventId: 1, status: 1 });
RegistrationSchema.index({ email: 1 });
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ eventId: 1, createdAt: -1 });

// Prevent duplicate registrations for the same event and email
RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Static method to get registrations by event
RegistrationSchema.statics.getByEvent = function(eventId: string) {
  return this.find({ eventId, status: { $ne: 'cancelled' } })
    .sort({ createdAt: -1 });
};

// Static method to get registration count by event
RegistrationSchema.statics.getCountByEvent = function(eventId: string) {
  return this.countDocuments({ eventId, status: 'confirmed' });
};

// Static method to get registration statistics
RegistrationSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $match: { status: 'confirmed' }
    },
    {
      $group: {
        _id: '$eventId',
        count: { $sum: 1 },
        recentRegistration: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'eventDetails'
      }
    },
    {
      $unwind: '$eventDetails'
    },
    {
      $project: {
        eventId: '$_id',
        eventTitle: '$eventDetails.title',
        eventDate: '$eventDetails.date',
        registrationCount: '$count',
        recentRegistration: '$recentRegistration'
      }
    },
    {
      $sort: { registrationCount: -1 }
    }
  ]);
};

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
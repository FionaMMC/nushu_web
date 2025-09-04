import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Registration model definition (inline to avoid import issues)
interface IRegistration extends mongoose.Document {
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

const RegistrationSchema = new mongoose.Schema<IRegistration>({
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

// Indexes
RegistrationSchema.index({ eventId: 1, status: 1 });
RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

const Registration = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);

// Database connection helper
let isConnected = false;

// JWT verification function
function verifyToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

const connectDatabase = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

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
    const registrationId = query.registrationId as string;
    const eventId = query.eventId as string;

    switch (method) {
      case 'GET':
        // Admin only - get registrations
        const authHeaderGet = req.headers.authorization;
        if (!authHeaderGet || !authHeaderGet.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }
        
        try {
          const token = authHeaderGet.substring(7);
          verifyToken(token);
        } catch (tokenError) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        if (registrationId) {
          // Get single registration
          const registration = await Registration.findById(registrationId);
          if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
          }
          return res.json({ success: true, data: { registration } });
        } else if (eventId) {
          // Get registrations for specific event
          const registrations = await Registration.find({ 
            eventId, 
            status: { $ne: 'cancelled' } 
          }).sort({ createdAt: -1 });
          
          const count = await Registration.countDocuments({ 
            eventId, 
            status: 'confirmed' 
          });

          return res.json({
            success: true,
            data: {
              registrations,
              count,
              eventId
            }
          });
        } else {
          // Get registration statistics by event
          const stats = await Registration.aggregate([
            {
              $match: { status: 'confirmed' }
            },
            {
              $group: {
                _id: '$eventId',
                count: { $sum: 1 },
                recentRegistration: { $max: '$createdAt' },
                registrations: { $push: '$$ROOT' }
              }
            },
            {
              $sort: { count: -1 }
            }
          ]);

          return res.json({
            success: true,
            data: { stats }
          });
        }

      case 'POST':
        // Public endpoint - create registration
        const registrationData = req.body;
        
        if (!registrationData || !registrationData.eventId || !registrationData.name || !registrationData.email) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: eventId, name, email' 
          });
        }

        try {
          const newRegistration = new Registration({
            eventId: registrationData.eventId,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            notes: registrationData.notes,
            status: 'confirmed'
          });

          await newRegistration.save();

          return res.status(201).json({
            success: true,
            data: { registration: newRegistration },
            message: 'Registration created successfully'
          });
        } catch (createError) {
          if (createError.code === 11000) {
            return res.status(400).json({
              success: false,
              message: 'Email already registered for this event'
            });
          }
          
          console.error('Registration creation error:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create registration'
          });
        }

      case 'PUT':
        // Admin only - update registration status
        if (!registrationId) {
          return res.status(400).json({ success: false, message: 'Registration ID required' });
        }

        const authHeaderPut = req.headers.authorization;
        if (!authHeaderPut || !authHeaderPut.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }
        
        try {
          const token = authHeaderPut.substring(7);
          verifyToken(token);
        } catch (tokenError) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        const updateData = req.body;
        const updatedRegistration = await Registration.findByIdAndUpdate(
          registrationId, 
          updateData, 
          { new: true }
        );
        
        if (!updatedRegistration) {
          return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        return res.json({
          success: true,
          data: { registration: updatedRegistration },
          message: 'Registration updated successfully'
        });

      case 'DELETE':
        // Admin only - cancel registration
        if (!registrationId) {
          return res.status(400).json({ success: false, message: 'Registration ID required' });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }
        
        try {
          const token = authHeaderDelete.substring(7);
          verifyToken(token);
        } catch (tokenError) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        // Soft delete - mark as cancelled
        const cancelledRegistration = await Registration.findByIdAndUpdate(
          registrationId,
          { status: 'cancelled' },
          { new: true }
        );
        
        if (!cancelledRegistration) {
          return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        return res.json({
          success: true,
          message: 'Registration cancelled successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export default handler;
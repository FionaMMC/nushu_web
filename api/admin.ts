import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// WebEvent model definition (same as in web-events.ts)
interface IWebEvent extends mongoose.Document {
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'current' | 'past';
  registrationLink?: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebEventSchema = new mongoose.Schema<IWebEvent>({
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

// Contact model definition (same as in contacts.ts)
interface IContact extends mongoose.Document {
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  response?: string;
}

const ContactSchema = new mongoose.Schema<IContact>({
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

const WebEvent = mongoose.models.WebEvent || mongoose.model<IWebEvent>('WebEvent', WebEventSchema);
const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

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
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    const { method, query } = req;
    const action = query.action as string;

    switch (method) {
      case 'POST':
        if (action === 'login') {
          // Admin login
          const { username, password } = req.body;

          if (!username || !password) {
            return res.status(400).json({
              success: false,
              message: 'Username and password are required'
            });
          }

          // Check credentials
          const adminUsername = process.env.ADMIN_USERNAME || 'admin';
          const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

          if (username !== adminUsername) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          let isValidPassword = false;
          if (adminPasswordHash) {
            isValidPassword = await bcrypt.compare(password, adminPasswordHash);
          } else {
            // Fallback for development
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
            isValidPassword = password === adminPassword;
          }

          if (!isValidPassword) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          // Generate JWT token
          const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
          const token = jwt.sign(
            { username, role: 'admin' },
            jwtSecret,
            { expiresIn: '24h' }
          );

          return res.json({
            success: true,
            data: {
              token,
              user: { username, role: 'admin' }
            },
            message: 'Login successful'
          });
        }
        break;

      case 'GET':
        if (action === 'dashboard') {
          // Get dashboard data
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }

          const [
            totalEvents,
            currentEvents,
            totalContacts,
            newContacts,
            recentEvents,
            recentContacts
          ] = await Promise.all([
            WebEvent.countDocuments({ isActive: true }),
            WebEvent.countDocuments({ status: 'current', isActive: true }),
            Contact.countDocuments(),
            Contact.countDocuments({ status: 'new' }),
            WebEvent.find({ isActive: true })
              .sort({ createdAt: -1 })
              .limit(5)
              .select('title date status'),
            Contact.find()
              .sort({ createdAt: -1 })
              .limit(5)
              .select('name email status createdAt')
          ]);

          return res.json({
            success: true,
            data: {
              stats: {
                totalEvents,
                upcomingEvents: currentEvents, // Keep key for compatibility
                totalContacts,
                newContacts,
                totalRegistrations: 0 // Removed registration tracking
              },
              recentActivity: {
                events: recentEvents,
                contacts: recentContacts,
                images: [] // TODO: Add image management when implemented
              }
            }
          });
        } else if (action === 'verify') {
          // Verify token
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }

          const token = authHeader.split(' ')[1];
          const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';

          try {
            const decoded = jwt.verify(token, jwtSecret) as any;
            return res.json({
              success: true,
              data: {
                user: { username: decoded.username, role: decoded.role }
              }
            });
          } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
          }
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    return res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

export default handler;

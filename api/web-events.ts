import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// WebEvent model definition (inline to avoid import issues)
interface IWebEvent extends mongoose.Document {
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

const WebEvent = mongoose.models.WebEvent || mongoose.model<IWebEvent>('WebEvent', WebEventSchema);

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
    console.log('✅ Database connected (web-events)');
  } catch (error) {
    console.error('❌ Database connection failed (web-events):', error);
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
    const eventId = query.eventId as string;

    // Explicit body parsing for Vercel
    let body = req.body;
    console.log('Raw request body type:', typeof body);
    console.log('Raw request body:', body);

    // Handle different body formats that Vercel might send
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
        console.log('Parsed JSON body successfully');
      } catch (parseError) {
        console.error('Failed to parse JSON body:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          debug: { originalBody: body, parseError: String(parseError) }
        });
      }
    }

    // Update req.body with parsed body
    req.body = body;
    console.log('Final processed body type:', typeof req.body);
    console.log('Final processed body:', req.body);

    switch (method) {
      case 'GET':
        if (eventId) {
          // Get single event
          const event = await WebEvent.findById(eventId).lean();
          if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
          }
          return res.json({ success: true, data: { event } });
        } else {
          // Get all events with filters
          const {
            status,
            limit = '50',
            page = '1'
          } = query;

          const filters: any = { isActive: true };
          if (status && status !== 'all') {
            filters.status = status;
          }

          const limitNum = Math.min(parseInt(limit as string) || 50, 100);
          const pageNum = parseInt(page as string) || 1;
          const skip = (pageNum - 1) * limitNum;

          const [events, total] = await Promise.all([
            WebEvent.find(filters)
              .sort({ date: -1, priority: -1 })
              .limit(limitNum)
              .skip(skip)
              .lean(),
            WebEvent.countDocuments(filters)
          ]);

          return res.json({
            success: true,
            data: {
              events,
              pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                limit: limitNum,
                count: events.length,
                totalRecords: total
              }
            }
          });
        }

      case 'POST':
        // Create new event (admin only)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }

        try {
          const token = authHeader.substring(7);
          verifyToken(token);
          console.log('POST /web-events - Token verified successfully');
        } catch (tokenError) {
          console.log('POST /web-events - Token verification failed:', String(tokenError));
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          const eventData = req.body;

          // Debug logging
          console.log('=== POST /web-events - DEBUG START ===');
          console.log('Request body:', eventData);
          console.log('Request body type:', typeof eventData);
          console.log('Request body keys:', Object.keys(eventData));
          console.log('=== POST /web-events - DEBUG END ===');

          // Validate and prepare event data
          if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
            console.log('POST /web-events - VALIDATION FAILED - Invalid event data type');
            return res.status(400).json({
              success: false,
              message: 'Invalid event data - must be object',
              debug: {
                receivedType: typeof eventData,
                isArray: Array.isArray(eventData),
                isNull: !eventData
              }
            });
          }

          // Ensure required fields exist
          const requiredFields = ['title', 'date', 'time', 'venue', 'blurb'];
          for (const field of requiredFields) {
            const value = eventData[field];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              console.log(`POST /web-events - FIELD VALIDATION FAILED for: ${field}`);
              return res.status(400).json({
                success: false,
                message: `Missing required field: ${field}`,
                required: requiredFields
              });
            }
          }

          // Create new event with validated data
          const newEvent = new WebEvent({
            title: eventData.title.trim(),
            date: eventData.date,
            time: eventData.time.trim(),
            venue: eventData.venue.trim(),
            tags: Array.isArray(eventData.tags) ? eventData.tags : [],
            blurb: eventData.blurb.trim(),
            status: eventData.status || 'current',
            registrationLink: eventData.registrationLink || '',
            priority: eventData.priority !== undefined ? Number(eventData.priority) : 0,
            isActive: eventData.isActive !== undefined ? eventData.isActive : true
          });

          await newEvent.save();
          console.log('POST /web-events - Event created successfully:', newEvent._id);

          return res.status(201).json({
            success: true,
            data: { event: newEvent },
            message: 'Event created successfully'
          });
        } catch (createError) {
          console.error('POST /web-events - Creation error:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: process.env.NODE_ENV === 'development' ? String(createError) : undefined
          });
        }

      case 'PUT':
        // Update event (admin only)
        if (!eventId) {
          return res.status(400).json({ success: false, message: 'Event ID required' });
        }

        const authHeaderPut = req.headers.authorization;
        if (!authHeaderPut || !authHeaderPut.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }

        try {
          const token = authHeaderPut.substring(7);
          verifyToken(token);
          console.log('PUT /web-events - Token verified successfully');
        } catch (tokenError) {
          console.log('PUT /web-events - Token verification failed:', String(tokenError));
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          const eventData = req.body;

          // Debug logging
          console.log('=== PUT /web-events - DEBUG START ===');
          console.log('PUT Request eventId:', eventId);
          console.log('PUT Request body:', eventData);
          console.log('=== PUT /web-events - DEBUG END ===');

          // Validate event data
          if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
            console.log('PUT /web-events - VALIDATION FAILED - Invalid event data type');
            return res.status(400).json({
              success: false,
              message: 'Invalid event data - must be object'
            });
          }

          const allowedUpdates = ['title', 'date', 'time', 'venue', 'tags', 'blurb', 'status', 'registrationLink', 'isActive', 'priority'];
          const updates: any = {};

          Object.keys(eventData).forEach(key => {
            if (allowedUpdates.includes(key)) {
              updates[key] = eventData[key];
            }
          });

          console.log('PUT /web-events - Update data prepared:', updates);

          const updatedEvent = await WebEvent.findByIdAndUpdate(
            eventId,
            updates,
            { new: true, runValidators: true }
          );

          if (!updatedEvent) {
            console.log('PUT /web-events - Event not found with ID:', eventId);
            return res.status(404).json({ success: false, message: 'Event not found' });
          }

          console.log('PUT /web-events - Event updated successfully:', updatedEvent._id);
          return res.json({
            success: true,
            data: { event: updatedEvent },
            message: 'Event updated successfully'
          });
        } catch (updateError) {
          console.error('PUT /web-events - Update error:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: process.env.NODE_ENV === 'development' ? String(updateError) : undefined
          });
        }

      case 'DELETE':
        // Delete event (admin only)
        if (!eventId) {
          return res.status(400).json({ success: false, message: 'Event ID required' });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Missing token' });
        }

        try {
          const token = authHeaderDelete.substring(7);
          verifyToken(token);
          console.log('DELETE /web-events - Token verified successfully');
        } catch (tokenError) {
          console.log('DELETE /web-events - Token verification failed:', String(tokenError));
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        const deletedEvent = await WebEvent.findByIdAndDelete(eventId);

        if (!deletedEvent) {
          return res.status(404).json({ success: false, message: 'Event not found' });
        }

        console.log('DELETE /web-events - Event deleted successfully:', deletedEvent._id);
        return res.json({
          success: true,
          message: 'Event deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error (web-events):', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export default handler;

// Vercel configuration for body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

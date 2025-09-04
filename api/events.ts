import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Event model definition (inline to avoid import issues)
interface IEvent extends mongoose.Document {
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>({
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
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Ensure we're using the correct collection name and clean up the schema
EventSchema.set('strict', false); // Allow flexible schema to handle legacy data
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

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
          debug: { originalBody: body, parseError: parseError.message }
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
          const event = await Event.findById(eventId);
          if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
          }
          return res.json({ success: true, data: { event } });
        } else {
          // Get all events with filters
          const {
            status = 'upcoming',
            limit = '10',
            page = '1',
            category
          } = query;

          const filters: any = { isActive: true };
          if (status && status !== 'all') {
            filters.status = status;
          }
          if (category) {
            filters.tags = { $in: [category] };
          }

          const limitNum = Math.min(parseInt(limit as string) || 10, 50);
          const pageNum = parseInt(page as string) || 1;
          const skip = (pageNum - 1) * limitNum;

          const [events, total] = await Promise.all([
            Event.find(filters)
              .sort({ date: 1, priority: -1 })
              .limit(limitNum)
              .skip(skip),
            Event.countDocuments(filters)
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
          console.log('POST /events - Token verified successfully');
        } catch (tokenError) {
          console.log('POST /events - Token verification failed:', tokenError.message);
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          const eventData = req.body;
          
          // Debug logging - More detailed
          console.log('=== POST /events - DEBUG START ===');
          console.log('Request headers:', req.headers);
          console.log('Request method:', req.method);
          console.log('Request body raw:', req.body);
          console.log('Request body type:', typeof eventData);
          console.log('Request body keys:', eventData ? Object.keys(eventData) : 'null/undefined');
          console.log('Request body values:', eventData ? Object.entries(eventData) : 'null/undefined');
          console.log('Is array?', Array.isArray(eventData));
          console.log('JSON stringify body:', JSON.stringify(eventData));
          console.log('=== POST /events - DEBUG END ===');
          
          // Validate and prepare event data
          if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
            console.log('POST /events - VALIDATION FAILED - Invalid event data type');
            console.log('Event data is null/undefined?', !eventData);
            console.log('Event data type:', typeof eventData);
            console.log('Event data is array?', Array.isArray(eventData));
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid event data - must be object',
              debug: {
                receivedType: typeof eventData,
                isArray: Array.isArray(eventData),
                isNull: !eventData,
                body: JSON.stringify(eventData)
              }
            });
          }

          // Ensure required fields exist
          const requiredFields = ['title', 'date', 'time', 'venue', 'blurb'];
          console.log('=== FIELD VALIDATION START ===');
          
          for (const field of requiredFields) {
            const value = eventData[field];
            console.log(`Checking field '${field}':`, {
              value: value,
              type: typeof value,
              exists: field in eventData,
              truthy: !!value,
              emptyString: typeof value === 'string' && value.trim() === ''
            });
            
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              console.log(`POST /events - FIELD VALIDATION FAILED for: ${field}`);
              console.log(`POST /events - Field value:`, value);
              console.log(`POST /events - All event data:`, eventData);
              
              return res.status(400).json({ 
                success: false, 
                message: `Missing required field: ${field}`,
                debug: {
                  missingField: field,
                  fieldValue: value,
                  fieldType: typeof value,
                  allData: eventData,
                  requiredFields: requiredFields
                }
              });
            }
          }
          
          console.log('=== FIELD VALIDATION PASSED ===');

          // Create new event with validated data
          const newEvent = new Event({
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            venue: eventData.venue,
            tags: eventData.tags || [],
            blurb: eventData.blurb,
            status: eventData.status || 'upcoming',
            priority: eventData.priority ? parseInt(eventData.priority) : 0,
            isActive: eventData.isActive !== false // default to true
          });

          await newEvent.save();

          return res.status(201).json({
            success: true,
            data: { event: newEvent },
            message: 'Event created successfully'
          });
        } catch (createError) {
          console.error('Event creation error:', createError);
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
          console.log('PUT /events - Token verified successfully');
        } catch (tokenError) {
          console.log('PUT /events - Token verification failed:', tokenError.message);
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        try {
          const eventData = req.body;
          
          // Debug logging - More detailed for PUT
          console.log('=== PUT /events - DEBUG START ===');
          console.log('PUT Request headers:', req.headers);
          console.log('PUT Request method:', req.method);
          console.log('PUT Request eventId:', eventId);
          console.log('PUT Request body raw:', req.body);
          console.log('PUT Request body type:', typeof eventData);
          console.log('PUT Request body keys:', eventData ? Object.keys(eventData) : 'null/undefined');
          console.log('PUT Request body values:', eventData ? Object.entries(eventData) : 'null/undefined');
          console.log('PUT Is array?', Array.isArray(eventData));
          console.log('PUT JSON stringify body:', JSON.stringify(eventData));
          console.log('=== PUT /events - DEBUG END ===');
          
          // Validate and prepare update data
          if (!eventData || typeof eventData !== 'object' || Array.isArray(eventData)) {
            console.log('PUT /events - VALIDATION FAILED - Invalid event data type');
            console.log('PUT Event data is null/undefined?', !eventData);
            console.log('PUT Event data type:', typeof eventData);
            console.log('PUT Event data is array?', Array.isArray(eventData));
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid event data - must be object',
              debug: {
                receivedType: typeof eventData,
                isArray: Array.isArray(eventData),
                isNull: !eventData,
                body: JSON.stringify(eventData)
              }
            });
          }
          
          console.log('PUT /events - Event data validation passed');

          const updateData: any = {};
          
          // Only update fields that are provided
          console.log('PUT /events - Building update data...');
          if (eventData.title !== undefined) updateData.title = eventData.title;
          if (eventData.date !== undefined) updateData.date = eventData.date;
          if (eventData.time !== undefined) updateData.time = eventData.time;
          if (eventData.venue !== undefined) updateData.venue = eventData.venue;
          if (eventData.tags !== undefined) updateData.tags = eventData.tags || [];
          if (eventData.blurb !== undefined) updateData.blurb = eventData.blurb;
          if (eventData.status !== undefined) updateData.status = eventData.status;
          if (eventData.priority !== undefined) updateData.priority = eventData.priority ? parseInt(eventData.priority) : 0;
          if (eventData.isActive !== undefined) updateData.isActive = eventData.isActive;
          
          // Clean up old fields that should no longer exist
          updateData.$unset = {
            capacity: 1,
            currentRegistrations: 1,
            registrationLink: 1
          };

          console.log('PUT /events - Update data prepared:', updateData);
          console.log('PUT /events - Update data keys:', Object.keys(updateData));
          console.log('PUT /events - About to update event with ID:', eventId);

          const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
          
          if (!updatedEvent) {
            console.log('PUT /events - Event not found with ID:', eventId);
            return res.status(404).json({ success: false, message: 'Event not found' });
          }

          console.log('PUT /events - Event updated successfully:', updatedEvent._id);
          return res.json({
            success: true,
            data: { event: updatedEvent },
            message: 'Event updated successfully'
          });
        } catch (updateError) {
          console.error('PUT /events - Update error:', updateError);
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
        } catch (tokenError) {
          return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
        }

        const deletedEvent = await Event.findByIdAndDelete(eventId);
        
        if (!deletedEvent) {
          return res.status(404).json({ success: false, message: 'Event not found' });
        }

        return res.json({
          success: true,
          message: 'Event deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
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
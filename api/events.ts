import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// Event model definition (inline to avoid import issues)
interface IEvent extends mongoose.Document {
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
  registrationLink: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: [0, 'Current registrations cannot be negative']
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

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    const { method, query } = req;
    const eventId = query.eventId as string;

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

          console.log('API Debug: Filters applied:', filters);
          console.log('API Debug: Limit:', limitNum, 'Skip:', skip);
          
          const [events, total] = await Promise.all([
            Event.find(filters)
              .sort({ date: 1, priority: -1 })
              .limit(limitNum)
              .skip(skip),
            Event.countDocuments(filters)
          ]);
          
          console.log('API Debug: Found', events.length, 'events, total count:', total);
          console.log('API Debug: First event:', events[0]?.title || 'None');

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
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        try {
          const eventData = req.body;
          
          // Validate and prepare event data
          if (!eventData || typeof eventData !== 'object') {
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid event data' 
            });
          }

          // Ensure required fields exist
          const requiredFields = ['title', 'date', 'time', 'venue', 'blurb'];
          for (const field of requiredFields) {
            if (!eventData[field]) {
              return res.status(400).json({ 
                success: false, 
                message: `Missing required field: ${field}` 
              });
            }
          }

          // Create new event with validated data
          const newEvent = new Event({
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            venue: eventData.venue,
            tags: eventData.tags || [],
            blurb: eventData.blurb,
            status: eventData.status || 'upcoming',
            registrationLink: eventData.registrationLink,
            capacity: eventData.capacity ? parseInt(eventData.capacity) : undefined,
            currentRegistrations: eventData.currentRegistrations ? parseInt(eventData.currentRegistrations) : 0,
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
            error: process.env.NODE_ENV === 'development' ? createError : undefined
          });
        }

      case 'PUT':
        // Update event (admin only)
        if (!eventId) {
          return res.status(400).json({ success: false, message: 'Event ID required' });
        }

        const authHeaderPut = req.headers.authorization;
        if (!authHeaderPut || !authHeaderPut.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const eventData = req.body;
        
        // Validate and prepare update data
        if (!eventData || typeof eventData !== 'object') {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid event data' 
          });
        }

        const updateData: any = {};
        
        // Only update fields that are provided
        if (eventData.title !== undefined) updateData.title = eventData.title;
        if (eventData.date !== undefined) updateData.date = eventData.date;
        if (eventData.time !== undefined) updateData.time = eventData.time;
        if (eventData.venue !== undefined) updateData.venue = eventData.venue;
        if (eventData.tags !== undefined) updateData.tags = eventData.tags || [];
        if (eventData.blurb !== undefined) updateData.blurb = eventData.blurb;
        if (eventData.status !== undefined) updateData.status = eventData.status;
        if (eventData.registrationLink !== undefined) updateData.registrationLink = eventData.registrationLink;
        if (eventData.capacity !== undefined) updateData.capacity = eventData.capacity ? parseInt(eventData.capacity) : undefined;
        if (eventData.currentRegistrations !== undefined) updateData.currentRegistrations = eventData.currentRegistrations ? parseInt(eventData.currentRegistrations) : 0;
        if (eventData.priority !== undefined) updateData.priority = eventData.priority ? parseInt(eventData.priority) : 0;
        if (eventData.isActive !== undefined) updateData.isActive = eventData.isActive;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
        
        if (!updatedEvent) {
          return res.status(404).json({ success: false, message: 'Event not found' });
        }

        return res.json({
          success: true,
          data: { event: updatedEvent },
          message: 'Event updated successfully'
        });

      case 'DELETE':
        // Delete event (admin only)
        if (!eventId) {
          return res.status(400).json({ success: false, message: 'Event ID required' });
        }

        const authHeaderDelete = req.headers.authorization;
        if (!authHeaderDelete || !authHeaderDelete.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
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
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

export default handler;
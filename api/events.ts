import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { Event } from '../src/models/Event.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const eventData = req.body;
        const newEvent = new Event(eventData);
        await newEvent.save();

        return res.status(201).json({
          success: true,
          data: { event: newEvent },
          message: 'Event created successfully'
        });

      case 'PUT':
        // Update event (admin only)
        if (!eventId) {
          return res.status(400).json({ success: false, message: 'Event ID required' });
        }

        const authHeaderPut = req.headers.authorization;
        if (!authHeaderPut || !authHeaderPut.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const updateData = req.body;
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
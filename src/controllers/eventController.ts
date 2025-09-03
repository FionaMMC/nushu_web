import { Request, Response } from 'express';
import { Event, IEvent } from '../models/Event.js';
import { Types } from 'mongoose';

// Interface for request body validation
interface CreateEventRequest {
  title: string;
  date: string;
  time: string;
  venue: string;
  tags?: string[];
  blurb: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  registrationLink?: string;
  capacity?: number;
  priority?: number;
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
  currentRegistrations?: number;
  isActive?: boolean;
}

// Get all events
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = '50', page = '1', category } = req.query;
    
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNumber - 1) * limitNumber;
    
    let query: any = { isActive: true };
    
    if (status && ['upcoming', 'ongoing', 'completed'].includes(status as string)) {
      query.status = status;
    }
    
    if (category) {
      query.tags = { $in: [category] };
    }
    
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ priority: -1, date: 1, createdAt: -1 })
        .limit(limitNumber)
        .skip(skip)
        .lean(),
      Event.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNumber,
          total: Math.ceil(total / limitNumber),
          limit: limitNumber,
          count: events.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string)));
    
    const events = await Event.find({
      status: 'upcoming',
      isActive: true,
      date: { $gte: new Date().toISOString().split('T')[0] }
    })
      .sort({ date: 1, priority: -1 })
      .limit(limitNumber)
      .lean();
    
    res.status(200).json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single event by ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }
    
    const event = await Event.findOne({ _id: id, isActive: true });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create new event (admin only)
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventData: CreateEventRequest = req.body;
    
    // Validate required fields
    const requiredFields: (keyof CreateEventRequest)[] = ['title', 'date', 'time', 'venue', 'blurb'];
    const missingFields = requiredFields.filter(field => !eventData[field]);
    
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
      return;
    }
    
    const event = new Event(eventData);
    const savedEvent = await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: savedEvent }
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    
    if (error?.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update event (admin only)
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateEventRequest = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: id, isActive: true },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    
    if (error?.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Soft delete event (admin only)
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update event registration count
export const updateRegistrationCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { increment = 1 } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }
    
    const event = await Event.findOne({ _id: id, isActive: true });
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    const newCount = Math.max(0, (event.currentRegistrations || 0) + increment);
    
    if (event.capacity && newCount > event.capacity) {
      res.status(400).json({
        success: false,
        message: 'Cannot exceed event capacity'
      });
      return;
    }
    
    event.currentRegistrations = newCount;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Registration count updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Error updating registration count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration count',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get event statistics (admin only)
export const getEventStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations
    ] = await Promise.all([
      Event.countDocuments({ isActive: true }),
      Event.countDocuments({ status: 'upcoming', isActive: true }),
      Event.countDocuments({ status: 'ongoing', isActive: true }),
      Event.countDocuments({ status: 'completed', isActive: true }),
      Event.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$currentRegistrations' } } }
      ])
    ]);
    
    const stats = {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations: totalRegistrations[0]?.total || 0
    };
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update event status (admin only)
export const updateEventStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }
    
    const validStatuses = ['upcoming', 'ongoing', 'completed'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: upcoming, ongoing, completed'
      });
      return;
    }
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    updateData.updatedAt = new Date();
    
    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }
    
    // Determine action message
    let actionMessage = 'Event status updated successfully';
    if (status === 'completed') actionMessage = 'Event marked as completed';
    else if (status === 'ongoing') actionMessage = 'Event marked as ongoing';
    else if (status === 'upcoming') actionMessage = 'Event marked as upcoming';
    else if (isActive === false) actionMessage = 'Event closed/deactivated';
    else if (isActive === true) actionMessage = 'Event activated';
    
    res.status(200).json({
      success: true,
      message: actionMessage,
      data: { event }
    });
  } catch (error: any) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
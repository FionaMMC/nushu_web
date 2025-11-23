import { Request, Response } from 'express';
import { WebEvent, IWebEvent } from '../models/WebEvent.js';

// Get all web events with optional filtering
export const getAllWebEvents = async (req: Request, res: Response) => {
  try {
    const { status, limit = '50', page = '1' } = req.query;

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isActive: true };

    if (status) {
      query.status = status;
    }

    const events = await WebEvent.find(query)
      .sort({ date: -1, priority: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await WebEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: Math.ceil(total / limitNum),
          count: events.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching web events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single web event by ID
export const getWebEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await WebEvent.findById(eventId).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Error fetching web event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new web event (Admin only)
export const createWebEvent = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE WEB EVENT DEBUG START ===');
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));

    const { title, date, time, venue, tags, blurb, status, registrationLink, posterImageUrl, posterBlobUrl, posterPathname, isActive, priority } = req.body;

    // Validation
    if (!title || !date || !time || !venue || !blurb) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['title', 'date', 'time', 'venue', 'blurb']
      });
    }

    const eventData: Partial<IWebEvent> = {
      title: title.trim(),
      date,
      time: time.trim(),
      venue: venue.trim(),
      tags: Array.isArray(tags) ? tags : [],
      blurb: blurb.trim(),
      status: status || 'current',
      registrationLink: registrationLink || '',
      posterImageUrl: posterImageUrl || '',
      posterBlobUrl: posterBlobUrl || '',
      posterPathname: posterPathname || '',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority !== undefined ? Number(priority) : 0
    };

    console.log('Processed event data:', eventData);

    const event = await WebEvent.create(eventData);
    console.log('Event created successfully:', event);

    res.status(201).json({
      success: true,
      data: { event },
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('=== CREATE WEB EVENT ERROR ===');
    console.error('Error:', error);
    console.error('Error type:', typeof error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update web event (Admin only)
export const updateWebEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const allowedUpdates = ['title', 'date', 'time', 'venue', 'tags', 'blurb', 'status', 'registrationLink', 'posterImageUrl', 'posterBlobUrl', 'posterPathname', 'isActive', 'priority'];
    const updates: any = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const event = await WebEvent.findByIdAndUpdate(
      eventId,
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { event },
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating web event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete web event (Admin only)
export const deleteWebEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await WebEvent.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting web event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

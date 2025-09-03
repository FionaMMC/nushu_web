import { Router } from 'express';
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateRegistrationCount,
  getEventStats,
  updateEventStatus
} from '../../controllers/eventController.js';
import { authenticateAdmin, authenticateOptional } from '../../utils/auth.js';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', getEventById);

// Protected routes - require authentication
router.post('/', authenticateAdmin, createEvent);
router.put('/:id', authenticateAdmin, updateEvent);
router.delete('/:id', authenticateAdmin, deleteEvent);
router.patch('/:id/registration', authenticateOptional, updateRegistrationCount);

// Admin-only routes
router.get('/admin/stats', authenticateAdmin, getEventStats);
router.patch('/:id/status', authenticateAdmin, updateEventStatus);

export default router;
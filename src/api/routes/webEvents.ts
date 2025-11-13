import express from 'express';
import {
  getAllWebEvents,
  getWebEventById,
  createWebEvent,
  updateWebEvent,
  deleteWebEvent
} from '../../controllers/webEventController.js';
import { authenticateAdmin } from '../../utils/auth.js';

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  if (req.query.eventId) {
    return getWebEventById(req, res);
  }
  return getAllWebEvents(req, res);
});

// Admin routes
router.post('/', authenticateAdmin, createWebEvent);
router.put('/', authenticateAdmin, updateWebEvent);
router.delete('/', authenticateAdmin, deleteWebEvent);

export default router;

import { Router } from 'express';
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
} from '../../controllers/contactController.js';
import { authenticateAdmin } from '../../utils/auth.js';

const router = Router();

// Public route - submit contact form
router.post('/submit', submitContact);

// Admin routes - require authentication
router.get('/', authenticateAdmin, getAllContacts);
router.get('/stats', authenticateAdmin, getContactStats);
router.get('/:id', authenticateAdmin, getContactById);
router.put('/:id', authenticateAdmin, updateContactStatus);
router.delete('/:id', authenticateAdmin, deleteContact);

export default router;
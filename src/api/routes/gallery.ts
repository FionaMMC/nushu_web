import { Router } from 'express';
import {
  getAllImages,
  getImagesByCategory,
  getImageById,
  uploadImage,
  createImageMetadata,
  updateImage,
  deleteImage,
  getCategories,
  getGalleryStats,
  bulkUpdateImages
} from '../../controllers/galleryController.js';
import { authenticateAdmin } from '../../utils/auth.js';
import { upload } from '../../config/storage.js';

const router = Router();

// Public routes
router.get('/', getAllImages);
router.get('/categories', getCategories);
router.get('/category/:category', getImagesByCategory);
router.get('/:id', getImageById);

// Protected routes - require admin authentication
router.post('/', authenticateAdmin, createImageMetadata); // For Vercel Blob metadata
router.post('/upload', authenticateAdmin, upload.single('image'), uploadImage);
router.put('/:id', authenticateAdmin, updateImage);
router.delete('/:id', authenticateAdmin, deleteImage);

// Admin-only routes
router.get('/admin/stats', authenticateAdmin, getGalleryStats);
router.patch('/admin/bulk-update', authenticateAdmin, bulkUpdateImages);

export default router;
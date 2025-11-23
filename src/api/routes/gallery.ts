import express, { Router } from 'express';
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

// Accept both multipart (multer) and raw binary (Vercel Blob handleUpload) uploads
const handleUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.is('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  return express.raw({ type: '*/*', limit: '10mb' })(req, res, next);
};

router.post('/upload', authenticateAdmin, handleUpload, uploadImage);
router.put('/:id', authenticateAdmin, updateImage);
router.delete('/:id', authenticateAdmin, deleteImage);

// Admin-only routes
router.get('/admin/stats', authenticateAdmin, getGalleryStats);
router.patch('/admin/bulk-update', authenticateAdmin, bulkUpdateImages);

export default router;

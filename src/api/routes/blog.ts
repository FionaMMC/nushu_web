import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} from '../../controllers/blogController.js';
import { authenticateAdmin } from '../../utils/auth.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => {
  if (req.query.blogId) {
    // Normalize query-based access to match frontend expectations
    req.params.id = String(req.query.blogId);
    return getPostById(req, res);
  }
  return getAllPosts(req, res);
});
router.get('/:id', getPostById);

// Protected routes - require admin authentication
router.post('/', authenticateAdmin, createPost);
router.put('/', authenticateAdmin, (req, res) => {
  if (req.query.blogId) {
    req.params.id = String(req.query.blogId);
  }
  return updatePost(req, res);
});
router.put('/:id', authenticateAdmin, updatePost);
router.delete('/', authenticateAdmin, (req, res) => {
  if (req.query.blogId) {
    req.params.id = String(req.query.blogId);
  }
  return deletePost(req, res);
});
router.delete('/:id', authenticateAdmin, deletePost);

export default router;

import { Router } from 'express';
import { authenticateAdmin, generateToken, verifyCredentials } from '../../utils/auth.js';
import { WebEvent } from '../../models/WebEvent.js';
import { GalleryImage } from '../../models/Gallery.js';

const router = Router();

// Admin login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Verify admin credentials
    const isValid = await verifyCredentials(username, password);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = generateToken({ username, role: 'admin' });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          username,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Admin dashboard data
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalEvents,
      currentEvents,
      totalImages,
      recentEvents,
      recentImages
    ] = await Promise.all([
      WebEvent.countDocuments({ isActive: true }),
      WebEvent.countDocuments({ status: 'current', isActive: true }),
      GalleryImage.countDocuments({ isActive: true }),
      WebEvent.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date status createdAt'),
      GalleryImage.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category createdAt')
    ]);

    const dashboardData = {
      stats: {
        totalEvents,
        upcomingEvents: currentEvents, // Keep the key name for backward compatibility
        totalImages,
        completedEvents: await WebEvent.countDocuments({
          status: 'past',
          isActive: true
        })
      },
      recentActivity: {
        events: recentEvents,
        images: recentImages
      }
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Verify token route (for checking if user is still authenticated)
router.get('/verify', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// System health check (admin only)
router.get('/health', authenticateAdmin, async (req, res) => {
  try {
    // Check database connectivity
    const dbStatus = await WebEvent.findOne().limit(1);
    
    const healthData = {
      status: 'healthy',
      database: dbStatus !== null ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
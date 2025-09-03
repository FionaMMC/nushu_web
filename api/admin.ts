import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simplified model references for admin dashboard
const Event = mongoose.models.Event;
const Contact = mongoose.models.Contact;

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

async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDatabase();

    const { method, query } = req;
    const action = query.action as string;

    switch (method) {
      case 'POST':
        if (action === 'login') {
          // Admin login
          const { username, password } = req.body;

          if (!username || !password) {
            return res.status(400).json({
              success: false,
              message: 'Username and password are required'
            });
          }

          // Check credentials
          const adminUsername = process.env.ADMIN_USERNAME || 'admin';
          const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

          if (username !== adminUsername) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          let isValidPassword = false;
          if (adminPasswordHash) {
            isValidPassword = await bcrypt.compare(password, adminPasswordHash);
          } else {
            // Fallback for development
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
            isValidPassword = password === adminPassword;
          }

          if (!isValidPassword) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }

          // Generate JWT token
          const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
          const token = jwt.sign(
            { username, role: 'admin' },
            jwtSecret,
            { expiresIn: '24h' }
          );

          return res.json({
            success: true,
            data: {
              token,
              user: { username, role: 'admin' }
            },
            message: 'Login successful'
          });
        }
        break;

      case 'GET':
        if (action === 'dashboard') {
          // Get dashboard data
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }

          const [
            totalEvents,
            upcomingEvents,
            totalContacts,
            newContacts,
            recentEvents,
            recentContacts
          ] = await Promise.all([
            Event.countDocuments({ isActive: true }),
            Event.countDocuments({ status: 'upcoming', isActive: true }),
            Contact.countDocuments(),
            Contact.countDocuments({ status: 'new' }),
            Event.find({ isActive: true })
              .sort({ createdAt: -1 })
              .limit(5)
              .select('title date status'),
            Contact.find()
              .sort({ createdAt: -1 })
              .limit(5)
              .select('name email status createdAt')
          ]);

          const totalRegistrations = await Event.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$currentRegistrations' } } }
          ]);

          return res.json({
            success: true,
            data: {
              stats: {
                totalEvents,
                upcomingEvents,
                totalContacts,
                newContacts,
                totalRegistrations: totalRegistrations[0]?.total || 0
              },
              recentActivity: {
                events: recentEvents,
                contacts: recentContacts
              }
            }
          });
        } else if (action === 'verify') {
          // Verify token
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }

          const token = authHeader.split(' ')[1];
          const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';

          try {
            const decoded = jwt.verify(token, jwtSecret) as any;
            return res.json({
              success: true,
              data: {
                user: { username: decoded.username, role: decoded.role }
              }
            });
          } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
          }
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    return res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

export default handler;

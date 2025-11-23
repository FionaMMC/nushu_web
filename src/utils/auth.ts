import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// Interface for JWT payload
interface JwtPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Generate JWT token
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Hash password (for initial setup)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify admin credentials
export const verifyCredentials = async (username: string, password: string): Promise<boolean> => {
  try {
    // Check if username matches
    if (username !== ADMIN_USERNAME) {
      return false;
    }
    
    // If no hash is set, compare with plain text (development only)
    if (!ADMIN_PASSWORD_HASH) {
      console.warn('WARNING: No hashed password set. Using fallback authentication.');
      return password === (process.env.ADMIN_PASSWORD || 'admin123');
    }
    
    // Compare with hashed password
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
};

// Middleware for admin authentication
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : undefined;
    const token = tokenFromHeader || tokenFromQuery;
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }
    
    const decoded = verifyToken(token);
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const authenticateOptional = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_WINDOW = 15 * 60 * 1000; // 15 minutes

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = authAttempts.get(clientIP);
  
  if (attempts) {
    // Reset counter if window has passed
    if (now - attempts.lastAttempt > AUTH_WINDOW) {
      authAttempts.delete(clientIP);
    } else if (attempts.count >= MAX_AUTH_ATTEMPTS) {
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((AUTH_WINDOW - (now - attempts.lastAttempt)) / 1000)
      });
      return;
    }
  }
  
  next();
};

// Record failed authentication attempt
export const recordFailedAttempt = (req: Request): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = authAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = now;
  
  authAttempts.set(clientIP, attempts);
};

// Clear successful authentication attempt
export const clearAuthAttempts = (req: Request): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  authAttempts.delete(clientIP);
};

// Utility to create admin user hash (for development/setup)
export const createAdminPasswordHash = async (password: string): Promise<void> => {
  const hash = await hashPassword(password);
  console.log(`Add this to your .env file:`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
};

// Input validation helpers
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  sanitizeString: (input: string, maxLength: number = 500): string => {
    return input.trim().substring(0, maxLength);
  }
};

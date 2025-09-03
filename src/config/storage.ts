import AWS from 'aws-sdk';
import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const S3_BUCKET = process.env.S3_BUCKET || 'nushu-society-uploads';

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP files are allowed.'));
  }
};

// Multer storage configuration for S3
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload file to S3
export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = 'general'
): Promise<{ url: string; key: string }> => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
  
  const params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as AWS.S3.ObjectCannedACL,
  };
  
  try {
    const result = await s3.upload(params).promise();
    
    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };
  
  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// Generate thumbnail URL (you might want to implement image processing)
export const generateThumbnail = (originalUrl: string): string => {
  // This is a simplified version - in production, you'd want to use 
  // AWS Lambda with Sharp or similar for actual image processing
  return originalUrl.replace('/original/', '/thumbnails/');
};

export { s3, S3_BUCKET };
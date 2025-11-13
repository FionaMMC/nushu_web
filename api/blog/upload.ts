import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import jwt from 'jsonwebtoken';

// JWT verification function
function verifyToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Authentication happens HERE in the callback
        console.log('Generating upload token for blog image:', pathname);

        // Get token from query parameter or Authorization header
        let token: string | null = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        } else if (req.query.token) {
          token = req.query.token as string;
        }

        if (!token) {
          console.log('POST /blog/upload - No token provided');
          throw new Error('Unauthorized - Missing token');
        }

        try {
          verifyToken(token);
          console.log('POST /blog/upload - Token verified successfully');
        } catch (tokenError) {
          console.log('POST /blog/upload - Token verification failed:', String(tokenError));
          throw new Error('Unauthorized - Invalid token');
        }

        // Token is valid, return the configuration
        return {
          allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            // optional, sent back to the client
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after the upload completes
        console.log('Blog image upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Blog image upload error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
}

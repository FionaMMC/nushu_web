import { VercelRequest, VercelResponse } from '@vercel/node';

// Temporary gallery API to prevent 404 errors
async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with specific configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        // Return empty gallery for now
        return res.json({
          success: true,
          data: {
            images: [],
            pagination: {
              current: 1,
              total: 1,
              limit: 10,
              count: 0,
              totalRecords: 0
            }
          }
        });

      case 'POST':
        // TODO: Implement image upload when AWS S3 is configured
        return res.status(501).json({
          success: false,
          message: 'Gallery upload not yet implemented - requires AWS S3 configuration'
        });

      case 'DELETE':
        // TODO: Implement image deletion
        return res.status(501).json({
          success: false,
          message: 'Gallery deletion not yet implemented'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Gallery API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

export default handler;
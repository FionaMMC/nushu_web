# Nüshu Society Website - Setup Guide

This guide will help you set up the Nüshu Society website with database integration and content management.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- AWS S3 account (for image storage)

## Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Copy `.env.example` to `.env` and configure the following variables:
   
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```bash
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/nushu-society
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nushu-society
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # Admin Credentials (default provided)
   ADMIN_USERNAME=nushu_admin
   ADMIN_PASSWORD=NushuAdmin2024!
   ADMIN_PASSWORD_HASH=$2b$12$RyqmN2Rol.GTmeHPS26myOF418yY/tbSMaIXdmnIeUCejUvVFewjy
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET=nushu-society-uploads
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Vite Environment Variables (for React app)
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Generate Admin Password Hash (Optional):**
   For better security, generate a hashed password:
   ```bash
   npm run server
   # In Node.js console:
   # const { hashPassword } = require('./src/utils/auth.js');
   # hashPassword('your-password').then(console.log);
   # Copy the hash to ADMIN_PASSWORD_HASH in .env
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** Start your local MongoDB service
   - **MongoDB Atlas:** Ensure your cluster is running and IP is whitelisted

5. **Set up AWS S3:**
   - Create an S3 bucket
   - Configure CORS policy for your bucket
   - Set up IAM user with S3 permissions

## Development

1. **Start the full application:**
   ```bash
   npm run dev:full
   ```
   This runs both the API server (port 3001) and React dev server (port 5173).

2. **Start components individually:**
   ```bash
   # Frontend only
   npm run dev
   
   # Backend API only
   npm run server:dev
   ```

3. **Access the application:**
   - **Main site:** http://localhost:5173
   - **Admin panel:** http://localhost:5173/admin
   - **API:** http://localhost:3001/api

## Usage

### Public Website
- Visit http://localhost:5173 to see the main website
- Events and gallery images will be loaded from the database
- If the API is unavailable, fallback content will be displayed

### Admin Panel
1. Visit http://localhost:5173/admin
2. Login with the default credentials:
   - **Username:** `nushu_admin`
   - **Password:** `NushuAdmin2024!`
3. Manage events and gallery images through the dashboard

⚠️ **Important:** Change the default admin password in production!

### API Endpoints

**Events:**
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

**Gallery:**
- `GET /api/gallery` - Get all images
- `GET /api/gallery/categories` - Get available categories
- `POST /api/gallery/upload` - Upload image (admin)
- `PUT /api/gallery/:id` - Update image metadata (admin)
- `DELETE /api/gallery/:id` - Delete image (admin)

**Admin:**
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard data (admin)

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-jwt-secret
   MONGODB_URI=your-production-mongodb-uri
   # ... other production values
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

The production build will serve both the React app and API from the same server.

## Database Structure

### Events Collection
- Title, date, time, venue
- Tags, description (blurb)
- Status (upcoming/ongoing/completed)
- Registration details (link, capacity, current registrations)
- Priority for ordering
- Active status for soft deletion

### Gallery Images Collection
- Title, description, alt text
- Image URLs (original and thumbnail)
- Category, priority
- S3 storage key for management
- File metadata (size, type, dimensions)
- Active status for soft deletion

## Troubleshooting

**MongoDB Connection Issues:**
- Check MongoDB is running
- Verify connection string in `.env`
- Ensure database user has proper permissions

**S3 Upload Issues:**
- Verify AWS credentials
- Check S3 bucket permissions and CORS
- Ensure bucket region matches configuration

**Admin Login Issues:**
- Verify admin credentials in `.env`
- Check JWT secret is properly set
- Check browser console for errors

**API Not Loading:**
- Verify server is running on correct port
- Check CORS configuration
- Ensure `VITE_API_URL` matches server URL

## Features

✅ **Completed:**
- Database integration with MongoDB
- Event management (CRUD operations)
- Gallery management with image upload
- Admin authentication system
- Cloud storage integration (S3)
- Image processing and thumbnails
- Responsive admin interface
- API with proper error handling
- Fallback to static content when API unavailable

🚀 **Future Enhancements:**
- User registration and authentication
- Email notifications for events
- Advanced image processing
- Content versioning
- Analytics dashboard
- Multi-language content management

## Support

For issues and questions, please check:
1. Console logs for error messages
2. Network tab for API request failures
3. Database connection status
4. Environment variable configuration

Contact the development team for additional support.
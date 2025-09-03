# Vercel Deployment Guide

This guide will help you deploy your Nüshu Society website to Vercel with a working database and API.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at https://www.mongodb.com/cloud/atlas
2. **Vercel Account**: Sign up at https://vercel.com
3. **AWS Account** (optional, for image uploads): Sign up at https://aws.amazon.com

## Step 1: Set up MongoDB Atlas Database

### 1.1 Create a MongoDB Atlas Cluster

1. Log in to MongoDB Atlas
2. Create a new project called "Nushu Society"
3. Create a cluster (choose the free tier)
4. Wait for the cluster to be ready (2-5 minutes)

### 1.2 Create Database User

1. In your Atlas project, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `nushu-admin`
5. Generate a secure password (save it!)
6. Grant "Read and write to any database" privileges
7. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Databases"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with the password you created
6. Replace `<dbname>` with `nushu-society`

Example: `mongodb+srv://nushu-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nushu-society?retryWrites=true&w=majority`

## Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com/dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2.3 Set Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Database connection |
| `JWT_SECRET` | Generate a random 32+ character string | JWT token signing |
| `ADMIN_USERNAME` | `nushu_admin` | Admin login username |
| `ADMIN_PASSWORD_HASH` | `$2b$12$RyqmN2Rol.GTmeHPS26myOF418yY/tbSMaIXdmnIeUCejUvVFewjy` | Admin password hash |
| `NODE_ENV` | `production` | Environment mode |

**Optional (for image uploads):**
| Name | Value | Description |
|------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | S3 image uploads |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | S3 image uploads |
| `AWS_REGION` | `us-east-1` | AWS region |
| `S3_BUCKET` | Your S3 bucket name | S3 bucket for images |

### 2.4 Deploy

Click "Deploy" and wait for the deployment to complete.

## Step 3: Seed the Database (Optional)

After deployment, you can add some initial events to your database:

1. Use MongoDB Compass or Atlas web interface
2. Connect to your database
3. Create some sample events in the `events` collection

Example event document:
```json
{
  "title": "Welcome Seminar: Introduction to Nüshu",
  "date": "2025-08-14",
  "time": "18:00 – 20:00", 
  "venue": "Law Library, Law Group Study Room M107",
  "tags": ["Seminar", "Social"],
  "blurb": "A welcoming session to introduce Nüshu for the semester.",
  "status": "upcoming",
  "capacity": 30,
  "currentRegistrations": 0,
  "priority": 0,
  "isActive": true
}
```

## Step 4: Test Your Deployment

### 4.1 Test the Website

1. Visit your Vercel deployment URL
2. Check that events load correctly
3. Test the contact form
4. Verify all pages work

### 4.2 Test Admin Access

1. Go to `https://your-domain.vercel.app/admin`
2. Login with:
   - Username: `nushu_admin`
   - Password: `NushuAdmin2024!`
3. Test creating, editing, and deleting events
4. Check contact management

## Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Database Connection Issues

- Check your MongoDB Atlas connection string
- Ensure network access is configured (0.0.0.0/0)
- Verify database user credentials

### Environment Variables

- Make sure all required environment variables are set in Vercel
- Check for typos in variable names
- Environment variables are case-sensitive

### API Endpoints

- API routes are automatically deployed as serverless functions
- Check Vercel function logs for errors
- API endpoints are available at `/api/*`

### Build Issues

- Ensure all dependencies are listed in package.json
- Check for TypeScript errors
- Verify build command is `npm run build`

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret for production
2. **Admin Credentials**: Change the default admin password
3. **Database**: Use strong database passwords
4. **Environment Variables**: Never commit secrets to your repository
5. **CORS**: The API is configured to allow requests from your domain

## Performance Optimization

1. **Database Indexing**: MongoDB indexes are automatically created
2. **Caching**: Vercel provides edge caching for static assets
3. **Image Optimization**: Consider using Vercel's image optimization
4. **Bundle Size**: Monitor your JavaScript bundle size

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Function Logs**: Check Vercel function logs for API issues
3. **Database Monitoring**: Use MongoDB Atlas monitoring
4. **Uptime Monitoring**: Consider setting up uptime monitoring

Your Nüshu Society website is now deployed and ready for use!
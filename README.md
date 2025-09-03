# Sydney University Nüshu Society — Website

A full-stack web application for the Sydney University Nüshu Society, built with React, Vite, Node.js, MongoDB, and Tailwind CSS. Features event management, contact forms, gallery, and admin dashboard.

## ✨ Features

- **Dynamic Events**: Database-driven event listings with registration tracking
- **Contact Management**: Contact form with admin response system
- **Admin Dashboard**: Full CRUD operations for events and contacts
- **Gallery**: Image gallery with category management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Bilingual Support**: English and Chinese language toggle
- **Database Integration**: MongoDB with Mongoose ODM

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string and other settings.

3. **Start Development Server**:
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately
   npm run dev        # Frontend only (http://localhost:5173)
   npm run server:dev # Backend only (http://localhost:3001)
   ```

4. **Access Admin Panel**:
   - Go to `http://localhost:5173/admin`
   - Default credentials: `nushu_admin` / `NushuAdmin2024!`

### Production Build

```bash
npm run build
```

## 🌐 Deploy to Vercel

### Option 1: Automated Script

```bash
./deploy.sh
```

### Option 2: Manual Deployment

1. **Prepare for Deployment**:
   - Push your code to GitHub
   - Set up MongoDB Atlas (see `DEPLOYMENT.md`)

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configure Environment Variables**:
   Add these in your Vercel project settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Random 32+ character string
   - `ADMIN_USERNAME`: `nushu_admin`
   - `ADMIN_PASSWORD_HASH`: `$2b$12$RyqmN2Rol.GTmeHPS26myOF418yY/tbSMaIXdmnIeUCejUvVFewjy`
   - `NODE_ENV`: `production`

4. **Deploy**: Click "Deploy" and your site will be live!

📖 **Detailed deployment instructions**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel Serverless Functions
- **Languages**: TypeScript, JavaScript

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
│   ├── admin.ts        # Admin authentication & dashboard
│   ├── contacts.ts     # Contact management
│   └── events.ts       # Event CRUD operations
├── src/
│   ├── components/     # React components
│   │   └── admin/     # Admin dashboard components
│   ├── models/        # MongoDB models
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   └── App.tsx        # Main application
├── vercel.json        # Vercel deployment config
├── DEPLOYMENT.md      # Detailed deployment guide
└── deploy.sh          # Automated deployment script
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ADMIN_USERNAME` | Admin login username | Yes |
| `ADMIN_PASSWORD_HASH` | Hashed admin password | Yes |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | Optional |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key | Optional |
| `S3_BUCKET` | S3 bucket name | Optional |

### Admin Default Credentials

- **Username**: `nushu_admin`
- **Password**: `NushuAdmin2024!`

⚠️ **Change these credentials in production!**

## 🎨 Customization

### Theme Colors

The design uses custom Tailwind colors defined in `tailwind.config.js`:
- `nushu-sage`: Deep green (#2D4A3E)
- `nushu-terracotta`: Warm orange (#D4A574)  
- `nushu-cream`: Light cream (#F5F3F0)
- `nushu-warm-white`: Warm white (#FEFEFE)

### Adding Content

1. **Events**: Use the admin dashboard at `/admin` to add/edit events
2. **Content**: Edit text content in `src/App.tsx` (search for `en` and `zh` objects)
3. **Images**: Place images in the `public/` directory
4. **Styling**: Modify Tailwind classes throughout the components

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Environment variable protection

## 📝 License

This project is created for the Sydney University Nüshu Society.

## 🤝 Support

For deployment issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. Review Vercel function logs for API errors
3. Verify environment variables are set correctly
4. Ensure MongoDB Atlas is properly configured

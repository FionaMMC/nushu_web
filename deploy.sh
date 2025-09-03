#!/bin/bash

# Nüshu Society Vercel Deployment Script

echo "🚀 Starting deployment process for Nüshu Society..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  1. Set up MongoDB Atlas database"
    echo "  2. Configure environment variables in Vercel dashboard"
    echo "  3. Test the admin login at /admin"
    echo "  4. Verify all API endpoints work"
    echo "  5. Test contact form submission"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
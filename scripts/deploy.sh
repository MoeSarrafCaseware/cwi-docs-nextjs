#!/bin/bash

# Quick deployment script for different platforms

echo "🚀 Caseware Cloud Docs - Deployment Helper"
echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended - handles large apps)"
echo "2) Netlify with R2 (Requires R2 setup first)"
echo "3) AWS Amplify"
echo "4) Cancel"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "📦 Deploying to Vercel..."
    echo ""
    
    # Check if vercel is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "Running deployment..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo "Your site is now live on Vercel."
    ;;
    
  2)
    echo ""
    echo "📦 Deploying to Netlify with R2..."
    echo ""
    
    # Check if R2_BUCKET_URL is set
    if [ -z "$R2_BUCKET_URL" ]; then
        echo "⚠️  Warning: R2_BUCKET_URL not set in environment"
        echo ""
        read -p "Have you uploaded docs to R2 and configured the bucket URL? (y/n): " confirmed
        
        if [ "$confirmed" != "y" ]; then
            echo ""
            echo "Please complete these steps first:"
            echo "1. Run: ./scripts/upload-to-r2.sh"
            echo "2. Set R2_BUCKET_URL in Netlify dashboard"
            echo "3. Update API route to use R2 version"
            echo ""
            echo "See QUICK_START_FIX.md for details"
            exit 1
        fi
    fi
    
    echo "Building and deploying..."
    npm run build:netlify
    
    echo ""
    echo "✅ Build complete!"
    echo "Push to main branch to trigger Netlify deployment."
    ;;
    
  3)
    echo ""
    echo "📦 AWS Amplify deployment..."
    echo ""
    echo "To deploy to AWS Amplify:"
    echo "1. Push your code to GitHub"
    echo "2. Go to AWS Amplify Console"
    echo "3. Connect your repository"
    echo "4. Set build command: npm run build"
    echo "5. Set output directory: .next"
    echo "6. Deploy!"
    ;;
    
  4)
    echo "Cancelled."
    exit 0
    ;;
    
  *)
    echo "Invalid choice."
    exit 1
    ;;
esac

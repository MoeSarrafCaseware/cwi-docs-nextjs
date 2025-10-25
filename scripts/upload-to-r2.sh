#!/bin/bash

# Upload Documentation to Cloudflare R2
# This script uploads all language documentation to R2 storage

BUCKET_NAME="cwi-docs"

echo "📦 Uploading documentation to Cloudflare R2..."
echo "Bucket: $BUCKET_NAME"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

# Login check
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || wrangler login

echo ""
echo "📤 Uploading documentation files..."

# Upload each language directory
languages=("en" "de" "es" "fr" "nl")

for lang in "${languages[@]}"; do
    echo ""
    echo "📁 Uploading $lang documentation..."
    
    # Upload Content directory
    if [ -d "public/$lang/Content" ]; then
        wrangler r2 object put "$BUCKET_NAME/$lang/Content" \
            --file="public/$lang/Content" \
            --recursive \
            --content-type="text/html"
        echo "✅ Uploaded $lang/Content"
    fi
    
    # Upload assets
    if [ -d "public/$lang/assets" ]; then
        wrangler r2 object put "$BUCKET_NAME/$lang/assets" \
            --file="public/$lang/assets" \
            --recursive
        echo "✅ Uploaded $lang/assets"
    fi
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "Next steps:"
echo "1. Get your R2 public URL from Cloudflare dashboard"
echo "2. Add R2_BUCKET_URL to your Netlify environment variables"
echo "3. Update src/app/api/content/route.ts to use R2"
echo "4. Add 'public/*/Content/' to .gitignore"
echo "5. Deploy to Netlify"

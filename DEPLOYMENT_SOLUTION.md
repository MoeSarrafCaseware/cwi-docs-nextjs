# Netlify Deployment Fix - Documentation Too Large

## Problem
The `___netlify-server-handler` function exceeds Netlify's 50MB limit because ~859MB of static documentation is being bundled.

## Recommended Solutions

### Option 1: Host Documentation on Cloudflare R2 (FREE & FAST)

**Benefits:**
- Free egress (no bandwidth costs)
- S3-compatible API
- Fast global CDN
- No Netlify function size limits

**Implementation Steps:**

1. **Create Cloudflare R2 Bucket**
   - Sign up at cloudflare.com
   - Create R2 bucket named `cwi-docs`
   - Enable public access or use presigned URLs

2. **Upload Documentation**
   ```bash
   # Install Cloudflare Wrangler
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Upload docs to R2
   wrangler r2 object put cwi-docs/en/Content --file=./public/en/Content --recursive
   wrangler r2 object put cwi-docs/de/Content --file=./public/de/Content --recursive
   wrangler r2 object put cwi-docs/es/Content --file=./public/es/Content --recursive
   wrangler r2 object put cwi-docs/fr/Content --file=./public/fr/Content --recursive
   wrangler r2 object put cwi-docs/nl/Content --file=./public/nl/Content --recursive
   ```

3. **Update API Route**
   Modify `src/app/api/content/route.ts` to fetch from R2:
   ```typescript
   const R2_BUCKET_URL = process.env.R2_BUCKET_URL; // https://pub-xxx.r2.dev
   const response = await fetch(`${R2_BUCKET_URL}/${language}/Content/${filePath}`);
   ```

4. **Environment Variables**
   Add to Netlify:
   ```
   R2_BUCKET_URL=https://pub-xxxxx.r2.dev
   ```

5. **Remove from Git**
   ```bash
   # Add to .gitignore
   echo "public/*/Content/" >> .gitignore
   
   # Remove from repo (save space)
   git rm -r --cached public/*/Content
   git commit -m "Move docs to R2 storage"
   ```

---

### Option 2: AWS S3 + CloudFront

**Similar to R2 but with AWS costs:**

```bash
# Install AWS CLI
brew install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://cwi-docs-content

# Upload docs
aws s3 sync ./public/en/Content s3://cwi-docs-content/en/Content --acl public-read
aws s3 sync ./public/de/Content s3://cwi-docs-content/de/Content --acl public-read
# ... repeat for all languages

# Set up CloudFront distribution for caching
```

**Environment Variable:**
```
S3_BUCKET_URL=https://cwi-docs-content.s3.amazonaws.com
```

---

### Option 3: Vercel (Alternative to Netlify)

Vercel handles large static assets better:

```bash
npm install -g vercel

# Deploy
vercel --prod
```

Vercel has better support for Next.js and higher function size limits (50MB uncompressed vs Netlify's compressed limit).

---

### Option 4: Keep on Netlify with Static Export

If you want to keep docs in the repo but avoid function bundling:

1. Use static export (already configured in next.config.ts)
2. Build static HTML
3. Deploy to Netlify as pure static site

**Issues:**
- Still need to host 859MB on Netlify (may hit bandwidth limits on free tier)
- No dynamic API routes (search won't work server-side)

---

## Cost Comparison

| Solution | Monthly Cost | Bandwidth | Speed |
|----------|--------------|-----------|-------|
| Cloudflare R2 | **$0** (10GB free) | Unlimited FREE | Fast |
| AWS S3 + CloudFront | ~$5-20 | $0.085/GB | Fast |
| Vercel | $0-20 (hobby/pro) | 100GB/1TB | Fast |
| Netlify Static | $0 | 100GB free | Medium |

---

## Recommended: Cloudflare R2

**Why R2 is best:**
- ✅ Completely free egress (save money)
- ✅ S3-compatible (easy migration)
- ✅ Fast global CDN
- ✅ No vendor lock-in
- ✅ Simple setup

**Next Steps:**
1. Create R2 bucket
2. Upload docs with wrangler
3. Update content API route
4. Remove docs from git repo
5. Deploy to Netlify (will be tiny now)

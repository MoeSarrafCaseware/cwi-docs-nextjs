# Quick Start: Fix Netlify Deployment

## ⚡ FASTEST Solution: Use Vercel Instead

Vercel handles large Next.js apps better and has higher limits:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (it will auto-detect Next.js)
vercel --prod
```

That's it! Vercel will handle everything automatically.

---

## 🔧 Alternative: Cloudflare R2 + Netlify

If you must use Netlify, move documentation to R2 storage:

### Step 1: Create Cloudflare R2 Bucket

1. Go to https://dash.cloudflare.com/
2. Navigate to R2 Object Storage
3. Create bucket named `cwi-docs`
4. Enable public access or custom domain

### Step 2: Upload Documentation

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Run upload script
./scripts/upload-to-r2.sh
```

Or manually:
```bash
# Upload each language
wrangler r2 object put cwi-docs --file=./public --recursive
```

### Step 3: Get R2 Public URL

Option A: Use R2.dev subdomain (automatic)
- URL: `https://pub-xxxxx.r2.dev`
- Found in R2 bucket settings → Public Access

Option B: Use custom domain (recommended for production)
- Add custom domain in bucket settings
- Example: `https://docs.caseware.cloud`

### Step 4: Update Environment Variables

Add to Netlify dashboard (Settings → Environment Variables):

```
R2_BUCKET_URL=https://pub-xxxxx.r2.dev
```

Or for custom domain:
```
R2_BUCKET_URL=https://docs.caseware.cloud
```

### Step 5: Update API Route

```bash
# Backup current route
mv src/app/api/content/route.ts src/app/api/content/route-local.ts.bak

# Use R2 version
cp src/app/api/content/route-r2.ts.example src/app/api/content/route.ts
```

### Step 6: Exclude Docs from Git

```bash
# Add to .gitignore
echo "" >> .gitignore
echo "# Documentation (hosted on R2)" >> .gitignore
echo "public/*/Content/" >> .gitignore
echo "public/*/assets/" >> .gitignore

# Remove from repo
git rm -r --cached public/*/Content public/*/assets
git commit -m "Move documentation to R2 storage"
```

### Step 7: Deploy to Netlify

```bash
git push origin main
```

Netlify will rebuild without the heavy docs (~50KB vs 859MB).

---

## 📊 Size Comparison

| What | Before | After |
|------|--------|-------|
| Function size | **~859MB** ❌ | ~5MB ✅ |
| Deploy time | Fails | ~30 seconds |
| Bandwidth cost | N/A | $0 (R2 free egress) |

---

## 🧪 Test Locally

Before deploying, test the R2 integration:

```bash
# Set environment variable
export R2_BUCKET_URL=https://pub-xxxxx.r2.dev

# Run dev server
npm run dev

# Visit any doc page and check browser console
# Should see "Fetching from R2: ..." logs
```

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# Restore local file API
mv src/app/api/content/route-local.ts.bak src/app/api/content/route.ts

# Restore docs from backup
git checkout HEAD~1 public/

# Deploy
git push origin main
```

---

## 💰 Cost Estimate

**Cloudflare R2:**
- Storage: 10GB free, then $0.015/GB/month
- Egress: **FREE** (unlimited)
- Operations: Class A: $4.50/million, Class B: $0.36/million
- **Estimated monthly cost:** $0-2

**AWS S3 + CloudFront:**
- Storage: $0.023/GB/month (~$20/month for 859MB)
- Egress via CloudFront: $0.085/GB
- **Estimated monthly cost:** $20-100 (depends on traffic)

**Vercel:**
- Free tier: 100GB bandwidth
- Pro: $20/month + $0.15/GB over limit
- **Estimated monthly cost:** $0-20

---

## 🆘 Troubleshooting

**Problem:** R2 upload fails
```bash
# Check auth
wrangler whoami

# Re-login
wrangler login
```

**Problem:** Images not loading
- Update image paths in HTML to use R2_BUCKET_URL
- Check CORS settings in R2 bucket

**Problem:** Content not found (404)
- Verify file exists in R2: `wrangler r2 object get cwi-docs/en/Content/Cloud-Home.htm`
- Check R2_BUCKET_URL environment variable

**Problem:** Still too large
- Make sure you removed `public/*/Content` from git
- Check `.next` folder size: `du -sh .next/`
- Clear build cache: `rm -rf .next`

---

## 📝 Next Steps

1. ✅ Choose solution (Vercel or R2)
2. ✅ Test locally
3. ✅ Deploy to production
4. ✅ Monitor for errors
5. ✅ Update documentation URLs if needed

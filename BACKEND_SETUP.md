# Caseware Cloud Documentation - Backend Setup Guide

This project now has a **separate backend server** for documentation indexing and search.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Next.js App   │────────▶│  Backend Server  │────────▶│  PostgreSQL  │
│  (Port 3000)    │         │   (Port 4000)    │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
     Frontend                    API + Indexing              Database
```

## Quick Start

### 1. Set up PostgreSQL

**Option A - Using Homebrew (macOS):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb cwi_docs
```

**Option B - Using Docker:**
```bash
docker run --name cwi-docs-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cwi_docs \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your database credentials (if different from defaults).

### 4. Start the Backend Server

```bash
cd server
npm start
```

This will:
- Create database tables
- Index all your HTML documentation files (~1-2 minutes for first run)
- Start the API server on http://localhost:4000

### 5. Start the Next.js App

In a **separate terminal**:

```bash
npm run dev
```

Your app will be at http://localhost:3000 (or 3001)

## How It Works

1. **On Backend Startup:**
   - The server scans `public/{language}/Content/` directories
   - Extracts title, content, and metadata from each HTML file
   - Stores in PostgreSQL with full-text search indexing

2. **When You Search:**
   - Next.js sends query to `/api/search`
   - Next.js proxies to backend `http://localhost:4000/api/search`
   - Backend queries PostgreSQL with full-text search
   - Returns ranked, relevant results
   - Your app navigates to the doc path (which already works!)

3. **Navigation:**
   - Search results return paths like `/en/Content/Setup/guide.htm`
   - Your app already knows how to render these files
   - **No changes needed** to your existing doc rendering logic!

## API Endpoints

### Backend (http://localhost:4000)
- `GET /api/search?q=<query>&lang=<language>&region=<region>` - Search docs
- `GET /api/stats` - Get indexing statistics
- `POST /api/reindex` - Manually re-index all docs
- `GET /health` - Health check

### Next.js (http://localhost:3000)
- `GET /api/search` - Proxies to backend

## Re-indexing

To re-index documentation after adding/updating files:

```bash
cd server
npm run index-docs
```

Or trigger via API:
```bash
curl -X POST http://localhost:4000/api/reindex
```

## Troubleshooting

### "Connection refused" or search not working
- Make sure backend server is running on port 4000
- Check `BACKEND_URL` in `.env.local` is correct

### "Database does not exist"
```bash
createdb cwi_docs
# Or using Docker:
docker exec -it cwi-docs-db createdb -U postgres cwi_docs
```

### No search results
- Check backend logs for indexing completion
- Visit http://localhost:4000/api/stats to see doc count
- Try re-indexing: `cd server && npm run index-docs`

## Environment Variables

### Next.js (`.env.local`)
```env
BACKEND_URL=http://localhost:4000
```

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://localhost:5432/cwi_docs
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cwi_docs
DB_USER=postgres
DB_PASSWORD=your_password
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Production Deployment

1. Deploy PostgreSQL database (AWS RDS, Heroku Postgres, etc.)
2. Deploy backend server (Heroku, Railway, DigitalOcean, etc.)
3. Update Next.js `BACKEND_URL` to point to production backend
4. Deploy Next.js app (Vercel, Netlify, etc.)

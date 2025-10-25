# Caseware Cloud Documentation Server

Backend API server for documentation search and indexing.

## Setup

### 1. Install PostgreSQL

#### macOS (using Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Or use Docker:
```bash
docker run --name cwi-docs-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cwi_docs \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start the Server

```bash
npm start
```

The server will:
- Initialize the database schema
- Index all documentation files (if database is empty)
- Start the API server on port 4000

## API Endpoints

### Search
```
GET /api/search?q=<query>&lang=<language>&region=<region>&limit=<number>
```

Example:
```bash
curl "http://localhost:4000/api/search?q=cloud&lang=en&limit=10"
```

### Get Statistics
```
GET /api/stats
```

### Re-index Documentation
```
POST /api/reindex
```

### Health Check
```
GET /health
```

## Manual Indexing

To manually re-index all documentation:

```bash
npm run index-docs
```

## Database Schema

```sql
documentation (
  id SERIAL PRIMARY KEY,
  language VARCHAR(10),
  region VARCHAR(50),
  file_path TEXT UNIQUE,
  title TEXT,
  content TEXT,
  html_content TEXT,
  section VARCHAR(255),
  url_path TEXT,
  metadata JSONB,
  search_vector tsvector,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Features

- **Full-text search** using PostgreSQL's tsvector
- **Automatic indexing** on server start (if database is empty)
- **Multi-language support** with language/region filtering
- **Ranked results** based on relevance
- **Section grouping** for organized search results
- **Snippet extraction** with highlighted matches

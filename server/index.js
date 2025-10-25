import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initializeDatabase } from './db.js';
import { indexAllDocumentation } from './scripts/index-docs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, lang, region, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ 
        results: [], 
        sectionResults: {},
        sortedSections: [],
        total: 0 
      });
    }

    const query = q.trim();
    
    // Build the search query
    let sqlQuery = `
      SELECT 
        id,
        language,
        region,
        file_path,
        title,
        content,
        section,
        url_path,
        ts_rank(search_vector, plainto_tsquery('english', $1)) as rank,
        ts_headline('english', content, plainto_tsquery('english', $1), 
          'MaxWords=50, MinWords=25, ShortWord=3, MaxFragments=1') as snippet
      FROM documentation
      WHERE search_vector @@ plainto_tsquery('english', $1)
    `;

    const params = [query];
    let paramIndex = 2;

    // Filter by language if provided
    if (lang) {
      sqlQuery += ` AND language = $${paramIndex}`;
      params.push(lang);
      paramIndex++;
    }

    // Filter by region if provided
    // NOTE: Currently the database stores region = language (e.g., 'en', 'de')
    // because the indexing script uses language for both fields.
    // We map the frontend region values to match what's in the database.
    if (region) {
      // Map region to what's actually stored in the database (just the language code)
      sqlQuery += ` AND region = $${paramIndex}`;
      params.push(lang || region.split('-')[0]); // Use language code as region
      paramIndex++;
    }

    // Order by relevance and limit results
    sqlQuery += ` ORDER BY rank DESC, title ASC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(sqlQuery, params);

    // Group results by section
    const sectionResults = {};
    const results = result.rows.map(row => {
      const section = row.section || 'General';
      
      if (!sectionResults[section]) {
        sectionResults[section] = [];
      }

      const resultObj = {
        title: row.title,
        href: row.url_path,
        section: section,
        snippet: row.snippet || row.content.substring(0, 200) + '...',
        matchType: row.rank > 0.1 ? 'title' : 'content',
        rank: parseFloat(row.rank)
      };

      sectionResults[section].push(resultObj);
      return resultObj;
    });

    // Sort sections by relevance (highest rank first)
    const sortedSections = Object.keys(sectionResults).sort((a, b) => {
      const maxRankA = Math.max(...sectionResults[a].map(r => r.rank));
      const maxRankB = Math.max(...sectionResults[b].map(r => r.rank));
      return maxRankB - maxRankA;
    });

    res.json({
      results,
      sectionResults,
      sortedSections,
      total: result.rows.length,
      query
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

// Get document by path
app.get('/api/document/:language/*', async (req, res) => {
  try {
    const { language } = req.params;
    const filePath = req.params[0];
    
    const result = await pool.query(
      'SELECT * FROM documentation WHERE language = $1 AND file_path = $2',
      [language, filePath]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        language,
        COUNT(*) as total_docs,
        COUNT(DISTINCT section) as total_sections
      FROM documentation
      GROUP BY language
      ORDER BY language
    `);

    const total = await pool.query('SELECT COUNT(*) as total FROM documentation');

    res.json({
      total: parseInt(total.rows[0].total),
      by_language: stats.rows
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Re-index endpoint (for manual refresh)
app.post('/api/reindex', async (req, res) => {
  try {
    res.json({ message: 'Indexing started in background' });
    
    // Run indexing in background
    indexAllDocumentation()
      .then(() => console.log('✓ Re-indexing complete'))
      .catch(err => console.error('Re-indexing failed:', err));
      
  } catch (error) {
    res.status(500).json({ error: 'Failed to start indexing' });
  }
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting Caseware Docs Server...\n');
    
    // Initialize database
    await initializeDatabase();
    
    // Check if we need to index documentation
    const count = await pool.query('SELECT COUNT(*) as count FROM documentation');
    const docCount = parseInt(count.rows[0].count);
    
    if (docCount === 0) {
      console.log('\n📚 No documents found in database. Starting initial indexing...\n');
      await indexAllDocumentation();
    } else {
      console.log(`\n✓ Database contains ${docCount} documents`);
      console.log('  (Run "npm run index-docs" to re-index)\n');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Search API: http://localhost:${PORT}/api/search?q=<query>`);
      console.log(`   Stats: http://localhost:${PORT}/api/stats\n`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

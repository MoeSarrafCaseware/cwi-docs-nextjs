import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cwi_docs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing database schema...');
    
    // Create the documentation table with full-text search support
    await client.query(`
      CREATE TABLE IF NOT EXISTS documentation (
        id SERIAL PRIMARY KEY,
        language VARCHAR(10) NOT NULL,
        region VARCHAR(50) NOT NULL,
        file_path TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        html_content TEXT,
        section VARCHAR(255),
        url_path TEXT NOT NULL,
        metadata JSONB,
        search_vector tsvector,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better search performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documentation_language 
      ON documentation(language);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documentation_region 
      ON documentation(region);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documentation_search 
      ON documentation USING GIN(search_vector);
    `);

    // Create a trigger to automatically update the search_vector
    await client.query(`
      CREATE OR REPLACE FUNCTION documentation_search_trigger() RETURNS trigger AS $$
      begin
        new.search_vector :=
          setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(new.content, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(new.section, '')), 'C');
        return new;
      end
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS tsvectorupdate ON documentation;
      CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
      ON documentation FOR EACH ROW EXECUTE FUNCTION documentation_search_trigger();
    `);

    console.log('✓ Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;

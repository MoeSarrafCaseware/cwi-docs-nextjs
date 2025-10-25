import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as cheerio from 'cheerio';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the public docs directory
const PUBLIC_DIR = path.join(__dirname, '../../public');

/**
 * Extract text content from HTML, removing scripts, styles, and MadCap attributes
 */
function extractTextFromHTML(html) {
  const $ = cheerio.load(html);
  
  // Remove script and style tags
  $('script, style').remove();
  
  // Remove MadCap specific elements
  $('[data-mc-conditions]').remove();
  
  // Get text content
  const text = $('body').text()
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  const $ = cheerio.load(html);
  
  // Try to get title from various sources
  let title = $('title').text();
  
  if (!title) {
    title = $('h1').first().text();
  }
  
  if (!title) {
    title = $('head meta[name="title"]').attr('content');
  }
  
  return title?.trim() || 'Untitled';
}

/**
 * Extract section/category from file path
 */
function extractSection(filePath) {
  const parts = filePath.split('/');
  const contentIndex = parts.findIndex(p => p === 'Content');
  
  if (contentIndex !== -1 && contentIndex + 1 < parts.length) {
    return parts[contentIndex + 1];
  }
  
  return 'General';
}

/**
 * Recursively find all .htm and .html files in a directory
 */
function findHTMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['Project', 'assets', 'Resources'].includes(file)) {
        findHTMLFiles(filePath, fileList);
      }
    } else if (file.endsWith('.htm') || file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Index a single HTML file
 */
async function indexFile(filePath, language, region) {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(html);
    const content = extractTextFromHTML(html);
    const section = extractSection(filePath);
    
    // Create URL path relative to public directory
    const relativePath = path.relative(PUBLIC_DIR, filePath);
    const urlPath = '/' + relativePath.replace(/\\/g, '/');
    
    // Insert into database
    await pool.query(
      `INSERT INTO documentation 
        (language, region, file_path, title, content, html_content, section, url_path, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (file_path) 
       DO UPDATE SET 
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         html_content = EXCLUDED.html_content,
         section = EXCLUDED.section,
         url_path = EXCLUDED.url_path,
         updated_at = CURRENT_TIMESTAMP`,
      [
        language,
        region,
        relativePath,
        title,
        content.substring(0, 50000), // Limit content length
        html.substring(0, 100000), // Store original HTML (limited)
        section,
        urlPath,
        JSON.stringify({ fileSize: html.length })
      ]
    );
    
    return { success: true, title };
  } catch (error) {
    console.error(`Error indexing ${filePath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Index all documentation for a specific language
 */
async function indexLanguage(language) {
  const languageDir = path.join(PUBLIC_DIR, language);
  
  if (!fs.existsSync(languageDir)) {
    console.log(`⚠ Language directory not found: ${language}`);
    return 0;
  }
  
  console.log(`📚 Indexing ${language} documentation...`);
  
  const contentDir = path.join(languageDir, 'Content');
  if (!fs.existsSync(contentDir)) {
    console.log(`⚠ Content directory not found for ${language}`);
    return 0;
  }
  
  const htmlFiles = findHTMLFiles(contentDir);
  console.log(`  Found ${htmlFiles.length} HTML files`);
  
  let indexed = 0;
  let failed = 0;
  
  for (const filePath of htmlFiles) {
    const result = await indexFile(filePath, language, language);
    if (result.success) {
      indexed++;
      if (indexed % 50 === 0) {
        console.log(`  Indexed ${indexed}/${htmlFiles.length} files...`);
      }
    } else {
      failed++;
    }
  }
  
  console.log(`✓ Indexed ${indexed} files for ${language} (${failed} failed)`);
  return indexed;
}

/**
 * Main indexing function
 */
export async function indexAllDocumentation() {
  console.log('🔄 Starting documentation indexing...\n');
  
  const startTime = Date.now();
  
  // Clear existing data
  console.log('🗑️  Clearing existing documentation...');
  await pool.query('TRUNCATE documentation RESTART IDENTITY');
  
  // Get all language directories
  const languages = fs.readdirSync(PUBLIC_DIR)
    .filter(item => {
      const itemPath = path.join(PUBLIC_DIR, item);
      return fs.statSync(itemPath).isDirectory() && 
             fs.existsSync(path.join(itemPath, 'Content'));
    });
  
  console.log(`Found languages: ${languages.join(', ')}\n`);
  
  let totalIndexed = 0;
  
  for (const language of languages) {
    const count = await indexLanguage(language);
    totalIndexed += count;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Indexing complete!`);
  console.log(`   Total files indexed: ${totalIndexed}`);
  console.log(`   Time taken: ${duration}s`);
  
  // Get database stats
  const stats = await pool.query(`
    SELECT language, COUNT(*) as count 
    FROM documentation 
    GROUP BY language 
    ORDER BY language
  `);
  
  console.log('\n📊 Database statistics:');
  stats.rows.forEach(row => {
    console.log(`   ${row.language}: ${row.count} documents`);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  indexAllDocumentation()
    .then(() => {
      console.log('\n✓ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

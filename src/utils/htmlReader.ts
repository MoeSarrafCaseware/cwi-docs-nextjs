import fs from 'fs';
import path from 'path';

export interface ParsedHTMLContent {
  title: string;
  content: string;
  body: string;
}

/**
 * Reads and parses snippet files (.flsnp)
 * @param snippetPath - The path to the snippet file relative to the HTML file
 * @param currentFilePath - The path of the current HTML file being processed
 * @returns Parsed snippet content
 */
function readSnippetFile(snippetPath: string, currentFilePath: string): string | null {
  try {
    // Resolve the snippet path relative to the current HTML file
    const currentDir = path.dirname(currentFilePath);
    const resolvedRelativePath = path.join(currentDir, snippetPath);
    const filePath = path.join(process.cwd(), 'public', 'en', resolvedRelativePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Snippet file not found: ${filePath}`);
      return null;
    }

    // Read the file
    const snippetContent = fs.readFileSync(filePath, 'utf-8');

    // Extract body content from the snippet
    const bodyMatch = snippetContent.match(/<body[^>]*>(.*?)<\/body>/is);
    if (bodyMatch) {
      // Simple cleaning without recursive processing
      let content = bodyMatch[1];
      // Remove MadCap attributes
      content = content.replace(/\s*MadCap:[^=]*="[^"]*"/gi, '');
      content = content.replace(/\s*xmlns:[^=]*="[^"]*"/gi, '');
      content = content.replace(/\s*data-mc-[^=]*="[^"]*"/gi, '');
      // Remove most class attributes but keep some basic ones
      content = content.replace(/\s*class="[^"]*"/gi, '');
      return content.trim();
    }

    return null;
  } catch (error) {
    console.error(`Error reading snippet file ${snippetPath}:`, error);
    return null;
  }
}

/**
 * Reads and parses HTML files from the public/en/Content directory
 * @param href - The href path from the navigation JSON (e.g., "/Content/Explore/Getting-Started/Supported-software-and-hardware.htm")
 * @returns Parsed HTML content with title and body
 */
export async function readHTMLFile(href: string): Promise<ParsedHTMLContent | null> {
  try {
    // Remove leading slash and add public/en prefix
    const cleanHref = href.startsWith('/') ? href.slice(1) : href;
    const filePath = path.join(process.cwd(), 'public', 'en', cleanHref);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`HTML file not found: ${filePath}`);
      return null;
    }

    // Read the file
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the HTML to extract title and body content
    const parsed = await parseHTMLContent(htmlContent, cleanHref);

    return parsed;
  } catch (error) {
    console.error(`Error reading HTML file ${href}:`, error);
    return null;
  }
}

/**
 * Parses HTML content to extract title and clean body content
 * @param htmlContent - Raw HTML content
 * @param currentFilePath - The path of the current HTML file being processed
 * @returns Parsed content with title and body
 */
async function parseHTMLContent(htmlContent: string, currentFilePath: string): Promise<ParsedHTMLContent> {
  // Extract title from <title> tag or <h1> tag
  const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i) ||
                    htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? cleanHTML(titleMatch[1]) : 'Untitled';

  // Extract body content
  const bodyMatch = htmlContent.match(/<body[^>]*>(.*?)<\/body>/is);
  let body = bodyMatch ? bodyMatch[1] : htmlContent;

  // Clean up the body content and process snippets
  body = await cleanHTMLContent(body, currentFilePath);

  return {
    title,
    content: body,
    body: body
  };
}

/**
 * Cleans HTML content by removing unwanted elements and normalizing structure
 * @param html - Raw HTML content
 * @param currentFilePath - The path of the current HTML file being processed
 * @returns Cleaned HTML content
 */
async function cleanHTMLContent(html: string, currentFilePath: string): Promise<string> {
  // Remove script tags and their content
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove style tags and their content
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Process MadCap elements BEFORE removing attributes
  // Convert MadCap xref to regular links (must be first to avoid being caught by broken link regex)
  html = html.replace(/<MadCap:xref href="([^"]+)">([^<]+)<\/MadCap:xref>/g, '<a href="$1" class="internal-link">$2</a>');
  
  // Handle MadCap snippet blocks - read and include actual content
  const snippetBlockMatches = html.match(/<MadCap:snippetBlock[^>]*src="([^"]+)"[^>]*\/>/g);
  if (snippetBlockMatches) {
    for (const match of snippetBlockMatches) {
      const srcMatch = match.match(/src="([^"]+)"/);
      if (srcMatch) {
        const snippetPath = srcMatch[1];
        const snippetContent = readSnippetFile(snippetPath, currentFilePath);
        if (snippetContent) {
          html = html.replace(match, `<div class="snippet-content">${snippetContent}</div>`);
        } else {
          html = html.replace(match, `<div class="snippet-placeholder">📄 Snippet: ${snippetPath}</div>`);
        }
      }
    }
  }
  
  // Handle MadCap snippet text - convert to inline placeholders
  html = html
    .replace(/<MadCap:snippetText[^>]*src="([^"]+)"[^>]*\/>/g, '<span class="snippet-text">📄 $1</span>')
    .replace(/<MadCap:snippetText[^>]*\/>/g, '<span class="snippet-text">📄 Snippet</span>')
    // Handle MadCap conditional text - extract content and remove MadCap wrapper
    .replace(/<MadCap:conditionalText[^>]*>([\s\S]*?)<\/MadCap:conditionalText>/g, '$1')
    // Remove other MadCap elements
    .replace(/<MadCap:[^>]*>[\s\S]*?<\/MadCap:[^>]*>/g, '')
    .replace(/<MadCap:[^>]*\/>/g, '');

  // Remove MadCap-specific attributes and elements (after processing MadCap elements)
  html = html.replace(/\s*MadCap:[^=]*="[^"]*"/gi, '');
  html = html.replace(/\s*xmlns:[^=]*="[^"]*"/gi, '');
  html = html.replace(/\s*data-mc-[^=]*="[^"]*"/gi, '');
  // Remove class attributes except for our custom classes
  html = html.replace(/\s*class="(?!internal-link|broken-link|snippet-placeholder|snippet-content|snippet-text|anchor|bold-text)[^"]*"/gi, '');
  
  // Fix malformed HTML tags and improve structure
  html = html
    // Fix broken link tags like <>text</></a> (after MadCap processing)
    .replace(/<>([^<]+)<\/><\/a>/g, '<span class="broken-link">$1</span>')
    // Convert name anchors to proper id spans
    .replace(/<a name="([^"]+)"[^>]*><\/a>/g, '<span id="$1" class="anchor"></span>')
    // Fix italic bold tags
    .replace(/<b style="font-style: italic;">([^<]+)<\/b>/g, '<em>$1</em>')
    // Convert i to em for better semantics
    .replace(/<i>([^<]+)<\/i>/g, '<em>$1</em>')
    // Convert b to span with bold styling (including nested elements)
    .replace(/<b>([\s\S]*?)<\/b>/g, '<span class="bold-text">$1</span>')
    // Fix broken closing tags
    .replace(/<\/a><b>/g, '</a> <strong>')
    // Add proper spacing around headings
    .replace(/<\/h([1-6])>/g, '</h$1>\n\n')
    // Add proper spacing around paragraphs
    .replace(/<\/p>/g, '</p>\n\n')
    // Add proper spacing around list items
    .replace(/<\/li>/g, '</li>\n')
    // Add proper spacing around lists
    .replace(/<\/ul>/g, '</ul>\n\n')
    .replace(/<\/ol>/g, '</ol>\n\n')
    // Fix self-closing img tags
    .replace(/<\/img>/g, '')
    // Convert relative image paths to absolute paths
    .replace(/<img([^>]*)\ssrc="([^"]+)"/g, (match, attrs, src) => {
      if (src.startsWith('http') || src.startsWith('/')) {
        return match; // Already absolute or external
      }
      // Convert relative path to absolute path
      const currentDir = path.dirname(currentFilePath);
      const resolvedPath = path.join(currentDir, src);
      const absolutePath = '/en/' + resolvedPath.replace(/\\/g, '/');
      return `<img${attrs} src="${absolutePath}"`;
    })
    // Add proper spacing around images (but not for inline images)
    .replace(/<img([^>]*)>/g, '<img$1>')
    // Add proper spacing around code blocks
    .replace(/<\/code>/g, '</code>')
    .replace(/<code([^>]*)>/g, '<code$1>')
    // Add proper spacing around pre blocks
    .replace(/<\/pre>/g, '</pre>\n\n')
    .replace(/<pre([^>]*)>/g, '<pre$1>\n')
    // Add proper spacing around blockquotes
    .replace(/<\/blockquote>/g, '</blockquote>\n\n')
    .replace(/<blockquote([^>]*)>/g, '<blockquote$1>\n')
    // Handle line breaks and horizontal rules
    .replace(/<br\s*\/?>/g, '<br />')
    .replace(/<hr\s*\/?>/g, '<hr />')
    // Add proper spacing around horizontal rules
    .replace(/<hr\s*\/?>/g, '\n<hr />\n\n')
    // Handle iframe elements - convert to responsive video containers
    .replace(/<iframe([^>]*)\s*\/?>/g, '<div class="video-container"><iframe$1></iframe></div>')
    // Clean up any duplicate iframe tags that might have been created
    .replace(/<\/iframe><\/iframe>/g, '</iframe>')
    // Clean up any orphaned iframe closing tags
    .replace(/<\/iframe>/g, '');
  
  // Clean up empty paragraphs, divs, and malformed tags
  html = html.replace(/<p[^>]*>\s*<\/p>/gi, '');
  html = html.replace(/<div[^>]*>\s*<\/div>/gi, '');
  html = html.replace(/<\s*\/\s*>/g, ''); // Remove empty self-closing tags like < />
  
  // Normalize whitespace but preserve line breaks
  html = html.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
  
  // Fix any remaining issues with inline content
  // Remove newlines that are in the middle of inline content (but preserve structure)
  html = html.replace(/([a-zA-Z0-9.,;:!?])\s*\n\s*([a-zA-Z0-9])/g, '$1 $2');
  // Fix newlines in the middle of inline tags (but preserve block element spacing)
  html = html.replace(/(<\/?(?:strong|em|b|i|span|a|img)[^>]*>)\s*\n\s*(<\/?(?:strong|em|b|i|span|a|img)[^>]*>)/g, '$1$2');
  // Fix newlines that break up sentences in the middle of words
  html = html.replace(/([a-zA-Z])\s*\n\s*([a-zA-Z])/g, '$1$2');
  // Fix newlines that break up sentences after punctuation
  html = html.replace(/([.,;:!?])\s*\n\s*([a-zA-Z])/g, '$1 $2');
  // Remove newlines that are in the middle of sentences (after words, before words)
  html = html.replace(/([a-zA-Z])\s*\n\s*([a-zA-Z])/g, '$1 $2');
  
  return html;
}

/**
 * Removes HTML tags from text content
 * @param html - HTML string
 * @returns Plain text
 */
function cleanHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}


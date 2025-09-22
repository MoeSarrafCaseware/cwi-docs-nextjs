/**
 * Client-side URL utilities (no Node.js dependencies)
 */

/**
 * Converts href path to a URL-friendly slug
 * @param href - The href path from navigation
 * @returns URL-friendly slug
 */
export function hrefToSlug(href: string): string {
  // Remove leading slash and file extension
  const cleanHref = href.replace(/^\//, '').replace(/\.htm$/, '');
  
  // Convert to slug format while preserving directory structure
  return cleanHref
    .toLowerCase()
    .replace(/[^a-z0-9\/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Converts slug back to href path
 * @param slug - URL slug
 * @returns Original href path
 */
export function slugToHref(slug: string): string {
  // Convert slug back to path format
  const path = slug.replace(/-/g, '/');
  
  return `/${path}.htm`;
}

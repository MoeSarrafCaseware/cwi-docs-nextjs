"use client";
import { useEffect, useState } from 'react';
import { ParsedHTMLContent } from '@/utils/htmlReader';
import './test-docs.css';

interface TestHTMLContentProps {
  href: string;
  fallbackTitle?: string;
}

export default function TestHTMLContent({ href }: TestHTMLContentProps) {
  const [content, setContent] = useState<ParsedHTMLContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        setError(null);
        
        // For client-side, we need to fetch the content via API
        const response = await fetch(`/api/content?href=${encodeURIComponent(href)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.statusText}`);
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error('Error loading HTML content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    }

    if (href) {
      loadContent();
    }
  }, [href]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 text-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-purple-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 text-gray-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Content</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Path: {href}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 text-gray-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Content Not Found</h1>
          <p className="text-gray-400">The requested content could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Document Header */}
      <div className="mb-8 pb-6 border-b border-purple-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Documentation</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{content.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last updated: {new Date().toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {href.split('/').pop()}
          </span>
        </div>
      </div>

      {/* Content */}
      <article className="prose prose-invert max-w-none test-docs">
        <div 
          className="html-content"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </article>

      {/* Document Footer */}
      <div className="mt-12 pt-6 border-t border-purple-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need help? Contact support
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

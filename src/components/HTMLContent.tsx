"use client";
import { useEffect, useState } from 'react';
import { ParsedHTMLContent } from '@/utils/htmlReader';

interface HTMLContentProps {
  href: string;
  fallbackTitle?: string;
}

export default function HTMLContent({ href }: HTMLContentProps) {
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading content...</p>
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
      <article className="prose prose-invert max-w-none">
        <div 
          className="html-content"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </article>
    </div>
  );
}

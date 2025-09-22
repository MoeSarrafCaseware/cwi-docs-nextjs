import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#e5e7eb',
            lineHeight: '1.7',
            fontSize: '1rem',
            h1: {
              color: '#ffffff',
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              marginTop: '0',
              borderBottom: '2px solid #374151',
              paddingBottom: '0.5rem',
            },
            h2: {
              color: '#ffffff',
              fontSize: '1.875rem',
              fontWeight: '600',
              marginBottom: '1rem',
              marginTop: '2.5rem',
              borderBottom: '1px solid #374151',
              paddingBottom: '0.25rem',
            },
            h3: {
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              marginTop: '2rem',
            },
            h4: {
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              marginTop: '1.5rem',
            },
            h5: {
              color: '#ffffff',
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              marginTop: '1.25rem',
            },
            h6: {
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              marginTop: '1rem',
            },
            p: {
              marginBottom: '1.25rem',
              color: '#d1d5db',
            },
            a: {
              color: '#60a5fa',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'all 0.2s ease',
              fontWeight: '500',
              '&:hover': {
                color: '#93c5fd',
                borderBottomColor: '#93c5fd',
              },
            },
            strong: {
              color: '#ffffff',
              fontWeight: '600',
            },
            em: {
              color: '#e5e7eb',
              fontStyle: 'italic',
            },
            code: {
              backgroundColor: '#374151',
              color: '#f3f4f6',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              border: '1px solid #4b5563',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              margin: '1.5rem 0',
              border: '1px solid #374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '& code': {
                backgroundColor: 'transparent',
                padding: '0',
                border: 'none',
                color: 'inherit',
                fontSize: '0.875rem',
              },
            },
            blockquote: {
              borderLeft: '4px solid #60a5fa',
              paddingLeft: '1.5rem',
              margin: '1.5rem 0',
              color: '#9ca3af',
              fontStyle: 'italic',
              backgroundColor: '#1f2937',
              padding: '1rem 1.5rem',
              borderRadius: '0.375rem',
            },
            ul: {
              marginBottom: '1.5rem',
              paddingLeft: '2rem',
              color: '#d1d5db',
              listStyleType: 'disc',
              listStylePosition: 'outside',
            },
            ol: {
              marginBottom: '1.5rem',
              paddingLeft: '2rem',
              color: '#d1d5db',
              listStyleType: 'decimal',
              listStylePosition: 'outside',
            },
            li: {
              marginBottom: '0.5rem',
              color: '#d1d5db',
              lineHeight: '1.6',
              '& p': {
                marginBottom: '0.5rem',
              },
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              margin: '1.5rem 0',
              backgroundColor: '#1f2937',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            th: {
              backgroundColor: '#374151',
              color: '#ffffff',
              fontWeight: '600',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              borderBottom: '1px solid #374151',
            },
            td: {
              color: '#d1d5db',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              borderBottom: '1px solid #374151',
            },
            'tr:hover': {
              backgroundColor: '#374151',
            },
            img: {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              margin: '1rem 0',
              display: 'block',
            },
            hr: {
              border: 'none',
              height: '1px',
              backgroundColor: '#374151',
              margin: '2rem 0',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config

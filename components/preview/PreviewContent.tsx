'use client';

import React from 'react';
import { usePreview } from './PreviewProvider';
import { sanitizeHtml } from '@/lib/sanitize';

interface PreviewContentProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Component that displays preview content with loading and error states
 */
export function PreviewContent({
  children,
  fallback,
  className = '',
}: PreviewContentProps) {
  const { isPreview, isLoading, error, post } = usePreview();

  // If not in preview mode, render children or nothing
  if (!isPreview) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading && !post) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center">
          <svg
            className="w-8 h-8 animate-spin mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Chargement de la prévisualisation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center text-red-600">
          <svg
            className="w-8 h-8 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-sm">Erreur lors du chargement de la prévisualisation</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // No post found
  if (!post) {
    return fallback ? <>{fallback}</> : null;
  }

  // Render children with post data available via context
  return <>{children}</>;
}

/**
 * Component that renders the post title from preview
 */
export function PreviewTitle({ className = '' }: { className?: string }) {
  const { post } = usePreview();

  if (!post) return null;

  return (
    <h1
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
    />
  );
}

/**
 * Component that renders the post content from preview
 */
export function PreviewBody({ className = '' }: { className?: string }) {
  const { post } = usePreview();

  if (!post) return null;

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content.rendered) }}
    />
  );
}

/**
 * Component that renders the post excerpt from preview
 */
export function PreviewExcerpt({ className = '' }: { className?: string }) {
  const { post } = usePreview();

  if (!post) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.excerpt.rendered) }}
    />
  );
}

/**
 * Component that renders the featured image from preview
 */
export function PreviewFeaturedImage({
  className = '',
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const { post } = usePreview();

  const featuredMedia = post?._embedded?.['wp:featuredmedia']?.[0];

  if (!featuredMedia) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={featuredMedia.source_url}
      alt={featuredMedia.alt_text || ''}
      className={className}
      width={width}
      height={height}
    />
  );
}

/**
 * Component that renders post metadata from preview
 */
export function PreviewMeta({ className = '' }: { className?: string }) {
  const { post } = usePreview();

  if (!post) return null;

  const author = post._embedded?.author?.[0];
  const date = new Date(post.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
      {author && (
        <span className="flex items-center gap-2">
          {author.avatar_urls?.['48'] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatar_urls['48']}
              alt={author.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>{author.name}</span>
        </span>
      )}
      <time dateTime={post.date}>{date}</time>
      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs uppercase">
        {post.status}
      </span>
    </div>
  );
}

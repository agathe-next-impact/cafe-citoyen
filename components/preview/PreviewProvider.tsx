'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { WPPost } from '@/lib/wordpress-api';

interface PreviewContextType {
  isPreview: boolean;
  isLoading: boolean;
  error: string | null;
  post: WPPost | null;
  postType: string;
  refreshPreview: () => Promise<void>;
  exitPreview: () => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

interface PreviewProviderProps {
  children: React.ReactNode;
  initialPost?: WPPost | null;
  postId?: string | number;
  postType?: string;
  token?: string;
  isPreview?: boolean;
}

export function PreviewProvider({
  children,
  initialPost = null,
  postId,
  postType = 'post',
  token,
  isPreview = false,
}: PreviewProviderProps) {
  const [post, setPost] = useState<WPPost | null>(initialPost);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!postId || !isPreview) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/preview/fetch?id=${postId}&postType=${postType}${token ? `&token=${token}` : ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }

      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [postId, postType, token, isPreview]);

  const refreshPreview = useCallback(async () => {
    await fetchPreview();
  }, [fetchPreview]);

  const exitPreview = useCallback(() => {
    // Clear preview mode by redirecting to the exit-preview API route
    window.location.href = '/api/preview/exit';
  }, []);

  // Auto-refresh preview content periodically
  useEffect(() => {
    if (!isPreview) return;

    // Fetch initial preview
    if (!initialPost && postId) {
      fetchPreview();
    }

    // Set up polling for live preview updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchPreview();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPreview, initialPost, postId, fetchPreview]);

  // Listen for messages from WordPress editor (live preview iframe)
  useEffect(() => {
    if (!isPreview) return;

    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed
      // if (event.origin !== process.env.NEXT_PUBLIC_WORDPRESS_URL) return;

      if (event.data?.type === 'WP_PREVIEW_UPDATE') {
        fetchPreview();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPreview, fetchPreview]);

  return (
    <PreviewContext.Provider
      value={{
        isPreview,
        isLoading,
        error,
        post,
        postType,
        refreshPreview,
        exitPreview,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}

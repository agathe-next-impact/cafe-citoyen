'use client';

import React from 'react';
import { usePreview } from './PreviewProvider';

interface PreviewBannerProps {
  className?: string;
}

export function PreviewBanner({ className = '' }: PreviewBannerProps) {
  const { isPreview, isLoading, error, refreshPreview, exitPreview, post } = usePreview();

  if (!isPreview) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 flex items-center justify-between shadow-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span className="font-semibold">Mode prévisualisation</span>
        {post && (
          <span className="text-sm opacity-75">
            — {post.status === 'draft' ? 'Brouillon' : post.status === 'pending' ? 'En attente' : 'Révision'}
          </span>
        )}
        {isLoading && (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Chargement..."
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
        )}
        {error && (
          <span className="text-red-800 text-sm">Erreur: {error}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={refreshPreview}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-black/10 hover:bg-black/20 rounded transition-colors disabled:opacity-50"
          aria-label="Actualiser la prévisualisation"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
        <button
          onClick={exitPreview}
          className="px-3 py-1 text-sm bg-black text-white hover:bg-black/80 rounded transition-colors"
        >
          Quitter
        </button>
      </div>
    </div>
  );
}

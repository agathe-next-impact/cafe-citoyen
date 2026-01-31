"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type HeroMenuLink = {
  lien: {
    texte_du_lien: string;
    page: Array<{
      ID: number;
      post_title: string;
      post_name: string;
    }>;
  };
};

interface VideoHeroProps {
  embedHtml: string;
  menuLinks?: HeroMenuLink[];
}

// Extrait l'ID YouTube depuis une URL ou un embed HTML
function extractYouTubeId(input: string): string | null {
  // Patterns pour extraire l'ID YouTube
  const patterns = [
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extrait l'ID Vimeo depuis une URL ou un embed HTML
function extractVimeoId(input: string): string | null {
  const match = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function VideoHero({ embedHtml, menuLinks }: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | null>(null);

  // Détermine le type et l'ID de la vidéo
  useEffect(() => {
    const ytId = extractYouTubeId(embedHtml);
    if (ytId) {
      setVideoId(ytId);
      setVideoType('youtube');
      return;
    }
    
    const vimeoId = extractVimeoId(embedHtml);
    if (vimeoId) {
      setVideoId(vimeoId);
      setVideoType('vimeo');
    }
  }, [embedHtml]);

  // URL de l'iframe optimisée
  const iframeSrc = videoType === 'youtube' && videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=${videoId}`
    : videoType === 'vimeo' && videoId
    ? `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&controls=0&title=0&byline=0&portrait=0&loop=1&background=1`
    : null;

  // Convertit menuLinks en tableau
  let safeMenuLinks: HeroMenuLink[] = [];
  if (Array.isArray(menuLinks)) {
    safeMenuLinks = menuLinks;
  } else if (menuLinks && typeof menuLinks === 'object') {
    safeMenuLinks = [menuLinks as HeroMenuLink];
  }

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      aria-label="Vidéo de présentation"
    >
      {/* Iframe YouTube/Vimeo */}
      {iframeSrc && (
        <div 
          ref={containerRef}
          className="absolute inset-0"
        >
          <iframe
            src={iframeSrc}
            className="video-iframe"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            title="Vidéo de présentation"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            rel="noreferrer"
          />
        </div>
      )}

      {/* Placeholder de chargement */}
      {!iframeSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-24 w-24 rounded-full bg-white/5 border border-white/10 animate-pulse"
            aria-hidden
          />
          <span className="sr-only">Chargement de la vidéo</span>
        </div>
      )}

      <style jsx>{`
        .video-iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 100vh;
          min-width: 177.77vh;
          min-height: 56.25vw;
          border: none;
          pointer-events: none;
        }
      `}</style>
      
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      
      {/* Menu vertical surimposé */}
      {safeMenuLinks.length > 0 && (
        <nav 
          className="absolute right-8 bottom-20 -translate-y-1/2 z-10"
          aria-label="Navigation rapide"
        >
          <ul className="flex flex-col gap-3">
            {safeMenuLinks.map((item, index) => {
              const pageData = item.lien?.page?.[0];
              const linkText = item.lien?.texte_du_lien || pageData?.post_title;
              const linkUrl = pageData?.url || (typeof pageData?.post_name === 'string' ? `/${pageData.post_name}` : undefined);
              if (!linkText || !linkUrl) return null;
              return (
                <li key={index}>
                  <Link
                    href={linkUrl}
                    className="group flex items-center justify-end gap-3 px-5 py-3 
                               bg-white/20 backdrop-blur-md
                               border border-white 
                               text-white text-base font-light
                               transition-all duration-300 ease-out
                               hover:bg-white/40 hover:border-white/40 hover:scale-105"
                  >
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">
                      {linkText}
                    </span>
                    <svg 
                      className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </section>
  );
}
  

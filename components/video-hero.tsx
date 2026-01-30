"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface VideoHeroProps {
  embedHtml: string;
}

export function VideoHero({ embedHtml }: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [processedEmbed, setProcessedEmbed] = useState<string | null>(null);

  // N'observe le composant que côté client pour différer le chargement de l'iframe
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const buildIframeHtml = useCallback((html: string) => {
    if (!html || typeof window === "undefined") return html;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const iframe = wrapper.querySelector("iframe");
    if (!iframe || !iframe.src) return html;

    try {
      const url = new URL(iframe.src);
      const src = iframe.src;

      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        url.searchParams.set("controls", "0");
        url.searchParams.set("showinfo", "0");
        url.searchParams.set("rel", "0");
        url.searchParams.set("modestbranding", "1");
        url.searchParams.set("loop", "1");
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("mute", "1");
        url.searchParams.set("playsinline", "1");
        const videoId =
          url.pathname.split("/").pop() || url.searchParams.get("v");
        if (videoId) {
          url.searchParams.set("playlist", videoId);
        }
      } else if (src.includes("vimeo.com")) {
        url.searchParams.set("controls", "0");
        url.searchParams.set("title", "0");
        url.searchParams.set("byline", "0");
        url.searchParams.set("portrait", "0");
        url.searchParams.set("loop", "1");
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("muted", "1");
        url.searchParams.set("playsinline", "1");
      }

      iframe.src = url.toString();
    } catch (error) {
      console.warn("Impossible d'optimiser l'URL de la vidéo", error);
    }

    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.setAttribute(
      "allow",
      "autoplay; fullscreen; picture-in-picture; encrypted-media",
    );
    iframe.setAttribute(
      "title",
      iframe.getAttribute("title") || "Vidéo de présentation",
    );

    return wrapper.innerHTML;
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    setProcessedEmbed(buildIframeHtml(embedHtml));
  }, [buildIframeHtml, embedHtml, shouldLoad]);

  const placeholder = useMemo(
    () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-24 w-24 rounded-full bg-white/5 border border-white/10 animate-pulse"
          aria-hidden
        />
        <span className="sr-only">Chargement de la vidéo</span>
      </div>
    ),
    [],
  );

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      aria-label="Vidéo de présentation"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {processedEmbed ? (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: processedEmbed }}
          />
        ) : (
          placeholder
        )}
      </div>
      <style jsx>{`
        section :global(iframe) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 56.25vw; /* 16:9 aspect ratio */
          min-height: 100vh;
          min-width: 177.77vh; /* 16:9 aspect ratio */
          border: none;
          pointer-events: auto;
        }
      `}</style>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </section>
  );
}

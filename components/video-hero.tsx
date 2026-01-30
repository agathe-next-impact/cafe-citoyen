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
      const originalUrl = new URL(iframe.src);
      const src = iframe.src;
      let finalUrl: URL = originalUrl;

      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        // Utiliser le domaine nocookie pour un meilleur cache
        const newUrl = new URL("https://www.youtube-nocookie.com/embed/" + (originalUrl.pathname.split("/").pop() || originalUrl.searchParams.get("v")));
        newUrl.searchParams.set("controls", "0");
        newUrl.searchParams.set("showinfo", "0");
        newUrl.searchParams.set("rel", "0");
        newUrl.searchParams.set("modestbranding", "1");
        newUrl.searchParams.set("loop", "1");
        newUrl.searchParams.set("autoplay", "1");
        newUrl.searchParams.set("mute", "1");
        newUrl.searchParams.set("playsinline", "1");
        newUrl.searchParams.set("iv_load_policy", "3");
        newUrl.searchParams.set("disablekb", "1");
        newUrl.searchParams.set("enablejsapi", "1");
        const videoId =
          originalUrl.pathname.split("/").pop() || originalUrl.searchParams.get("v");
        if (videoId) {
          newUrl.searchParams.set("playlist", videoId);
        }
        finalUrl = newUrl;
      } else if (src.includes("vimeo.com")) {
        finalUrl.searchParams.set("controls", "0");
        finalUrl.searchParams.set("title", "0");
        finalUrl.searchParams.set("byline", "0");
        finalUrl.searchParams.set("portrait", "0");
        finalUrl.searchParams.set("loop", "1");
        finalUrl.searchParams.set("autoplay", "1");
        finalUrl.searchParams.set("muted", "1");
        finalUrl.searchParams.set("playsinline", "1");
      }

      iframe.src = finalUrl.toString();
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

  // Force la lecture de la vidéo au retour sur l'onglet
  useEffect(() => {
    if (!shouldLoad || typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const iframe = containerRef.current?.querySelector("iframe");
        if (iframe && iframe.contentWindow) {
          // Force la lecture via l'API YouTube
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            "*"
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [shouldLoad]);

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

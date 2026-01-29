"use client"

import { useEffect, useRef, useState } from "react"

interface VideoHeroProps {
  embedHtml: string
}

export function VideoHero({ embedHtml }: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Forcer le rechargement de l'iframe à chaque fois que le composant est monté
    setKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const iframe = containerRef.current.querySelector('iframe')
      if (iframe) {
        const src = iframe.src
        const url = new URL(src)
        
        // Ajouter les paramètres pour masquer les contrôles selon la plateforme
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          url.searchParams.set('controls', '0')
          url.searchParams.set('showinfo', '0')
          url.searchParams.set('rel', '0')
          url.searchParams.set('modestbranding', '1')
          url.searchParams.set('loop', '1')
          url.searchParams.set('autoplay', '1')
          url.searchParams.set('mute', '1')
          url.searchParams.set('playsinline', '1')
          // Pour YouTube, loop nécessite le paramètre playlist avec l'ID de la vidéo
          const videoId = url.pathname.split('/').pop() || url.searchParams.get('v')
          if (videoId) {
            url.searchParams.set('playlist', videoId)
          }
        } else if (src.includes('vimeo.com')) {
          url.searchParams.set('controls', '0')
          url.searchParams.set('title', '0')
          url.searchParams.set('byline', '0')
          url.searchParams.set('portrait', '0')
          url.searchParams.set('loop', '1')
          url.searchParams.set('autoplay', '1')
          url.searchParams.set('muted', '1')
          url.searchParams.set('playsinline', '1')
        }
        
        // Forcer le rechargement avec les nouveaux paramètres
        const newSrc = url.toString()
        if (iframe.src !== newSrc) {
          iframe.src = newSrc
        }
      }
    }
  }, [embedHtml, key])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black -mt-20">
      <div 
        key={key}
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
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
  )
}

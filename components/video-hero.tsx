"use client"

import { useEffect, useRef } from "react"

interface VideoHeroProps {
  videoSrc: string
}

export function VideoHero({ videoSrc }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [videoSrc])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black -mt-20">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
        <source src={videoSrc} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </section>
  )
}

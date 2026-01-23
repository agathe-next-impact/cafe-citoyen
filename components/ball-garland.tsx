"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function BallGarland() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const ballImages = [
    "/images/fichier-203-404x-2.png", // Purple
    "/images/fichier-205-404x-4.png", // Red
    "/images/fichier-201-404x-1.png", // Yellow
    "/images/fichier-202-404x-2.png", // Blue
    "/images/fichier-204-404x-3.png", // Green
  ]

  const balls = Array.from({ length: 8 }, (_, i) => ({
    image: ballImages[i % ballImages.length],
    id: i,
    xOffset: i * 12.5 + 6.25,
    size: 40 + (i % 3) * 8,
    topOffset: isScrolled ? 0 : 40 + (i % 3) * 15,
  }))

  if (!mounted) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] pointer-events-none overflow-visible backdrop-blur-sm bg-background/50">
      {balls.map((ball) => (
        <div
          key={ball.id}
          className="absolute transition-all duration-700 ease-in-out"
          style={{
            left: `${ball.xOffset}%`,
            top: `${ball.topOffset}px`,
            transform: "translateX(-50%)",
            width: `${ball.size}px`,
            height: `${ball.size}px`,
          }}
        >
          <Image
            src={ball.image || "/placeholder.svg"}
            alt=""
            width={ball.size}
            height={ball.size}
            loading="lazy"
            className="opacity-90 drop-shadow-lg rounded-full"
          />
        </div>
      ))}
    </div>
  )
}

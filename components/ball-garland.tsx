"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import Image from "next/image"

const ballImages = [
  "/images/fichier-203-404x-2.png",
  "/images/fichier-205-404x-4.png",
  "/images/fichier-201-404x-1.png",
  "/images/fichier-202-404x-2.png",
  "/images/fichier-204-404x-3.png",
]

export function BallGarland() {
  const pathRef = useRef<SVGPathElement>(null)
  const ballRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationRef = useRef<number>(0)
  const isScrolledRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [ballCount, setBallCount] = useState(8)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBallCount(4)
      } else if (window.innerWidth < 1024) {
        setBallCount(6)
      } else {
        setBallCount(8)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const balls = useMemo(
    () => {
      const spacing = 100 / ballCount
      return Array.from({ length: ballCount }, (_, i) => ({
        image: ballImages[i % ballImages.length],
        id: i,
        xOffset: i * spacing + (spacing / 2),
        size: 40 + (i % 3) * 8,
        baseTopOffset: 40 + (i % 3) * 15,
      }))
    },
    [ballCount]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      isScrolledRef.current = window.scrollY > 50
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let startTime: number | null = null
    let lastScrolled = false

    const getSwayOffset = (ball: (typeof balls)[0], index: number, sway: number) => {
      const swayFactor = Math.sin((index / (balls.length - 1)) * Math.PI)
      return sway * swayFactor
    }

    const getScrollOffset = (ball: (typeof balls)[0]) => {
      return isScrolledRef.current ? -ball.size / 2 - ball.baseTopOffset : 0
    }

    const generateRopePath = (sway: number) => {
      const points = balls.map((ball, index) => ({
        x: ball.xOffset,
        y: ball.baseTopOffset + getSwayOffset(ball, index, sway) + getScrollOffset(ball) + ball.size / 2,
      }))

      const baseStartY = 30
      const startY = isScrolledRef.current ? -20 : baseStartY + sway * 0.2
      const endY = isScrolledRef.current ? -20 : baseStartY + sway * 0.2
      const startPoint = { x: -5, y: startY }
      const endPoint = { x: 105, y: endY }

      const allPoints = [startPoint, ...points, endPoint]

      let path = `M ${allPoints[0].x} ${allPoints[0].y}`

      for (let i = 0; i < allPoints.length - 1; i++) {
        const p0 = allPoints[Math.max(0, i - 1)]
        const p1 = allPoints[i]
        const p2 = allPoints[i + 1]
        const p3 = allPoints[Math.min(allPoints.length - 1, i + 2)]

        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
      }

      return path
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Combine multiple sine waves for organic, fluid movement
      const sway =
        Math.sin(elapsed / 3500) * 6 +
        Math.sin(elapsed / 2200) * 4 +
        Math.sin(elapsed / 1500) * 2.5 +
        Math.sin(elapsed / 800) * 1

      // Update path directly via DOM for smooth 60fps
      if (pathRef.current) {
        pathRef.current.setAttribute("d", generateRopePath(sway))
      }

      // Check if scroll state changed
      const scrollChanged = lastScrolled !== isScrolledRef.current
      lastScrolled = isScrolledRef.current

      // Update ball positions using GPU-accelerated transforms
      balls.forEach((ball, index) => {
        const ballEl = ballRefs.current[index]
        if (ballEl) {
          const swayY = getSwayOffset(ball, index, sway)
          const scrollY = getScrollOffset(ball)
          
          // Use translate3d for GPU acceleration
          ballEl.style.transform = `translateX(-50%) translate3d(0, ${swayY + scrollY}px, 0)`
          
          // Update transition for smooth scroll behavior
          if (scrollChanged) {
            ballEl.style.transition = "transform 0.7s ease-in-out"
          } else {
            ballEl.style.transition = "none"
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationRef.current)
  }, [balls])

  if (!mounted) return null

  return (
    <div className="fixed top-0 left-0 right-0 pointer-events-none h-40">
      {/* Rope SVG */}
      <svg
        className="absolute top-0 left-0 w-full h-40"
        viewBox="0 0 100 160"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="#8B7355"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Balls */}
      {balls.map((ball, index) => (
        <div
          key={ball.id}
          ref={(el) => {
            ballRefs.current[index] = el
          }}
          className="absolute will-change-transform"
          style={{
            left: `${ball.xOffset}%`,
            top: `${ball.baseTopOffset}px`,
            transform: "translateX(-50%) translate3d(0, 0, 0)",
            width: `${ball.size}px`,
            height: `${ball.size}px`,
          }}
        >
          <Image
            src={ball.image || "/placeholder.svg"}
            alt=""
            width={ball.size}
            height={ball.size}
            className="opacity-90 drop-shadow-lg rounded-full"
            style={{ height: 'auto', width: 'auto' }}
          />
        </div>
      ))}
    </div>
  )
}

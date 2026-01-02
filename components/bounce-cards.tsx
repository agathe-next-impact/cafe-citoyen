"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import "./BounceCards.css"

interface BounceCardsProps {
  className?: string
  images?: string[]
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  enableHover?: boolean
}

export default function BounceCards({
  className = "",
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  enableHover = true,
}: BounceCardsProps) {
  const [mounted, setMounted] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const randomTransforms = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024

    const cardWidth = isMobile ? 180 : isTablet ? 240 : 300
    const cardHeight = isMobile ? 180 : isTablet ? 240 : 300

    const aspectRatio = containerWidth / containerHeight
    const totalCards = images.length - 1

    let cols = Math.ceil(Math.sqrt(totalCards * aspectRatio))
    let rows = Math.ceil(totalCards / cols)

    while (cols * rows - totalCards > cols && rows > 1) {
      rows--
      cols = Math.ceil(totalCards / rows)
    }

    const cellWidth = containerWidth / cols
    const cellHeight = containerHeight / rows

    const safeMargin = isMobile ? cardWidth / 2 : isTablet ? cardWidth / 3 : cardWidth / 4
    const maxTranslateX = (containerWidth - cardWidth) / 2 - safeMargin
    const maxTranslateY = (containerHeight - cardHeight) / 2 - safeMargin

    return images.map((_, idx) => {
      if (idx === images.length - 1) {
        return {
          transform: `rotate(0deg) translate(0px, 0px)`,
          translateX: 0,
          translateY: 0,
          rotation: 0,
        }
      }

      const col = idx % cols
      const row = Math.floor(idx / cols)

      const baseX = col * cellWidth - containerWidth / 2 + cellWidth / 2
      const baseY = row * cellHeight - containerHeight / 2 + cellHeight / 2

      const maxOffsetX = isMobile
        ? Math.min(cellWidth * 0.1, 20)
        : isTablet
          ? Math.min(cellWidth * 0.15, 30)
          : Math.min(cellWidth * 0.2, 40)
      const maxOffsetY = isMobile
        ? Math.min(cellHeight * 0.1, 20)
        : isTablet
          ? Math.min(cellHeight * 0.15, 30)
          : Math.min(cellHeight * 0.2, 40)

      const offsetX = (Math.random() - 0.5) * maxOffsetX * 2
      const offsetY = (Math.random() - 0.5) * maxOffsetY * 2

      let translateX = baseX + offsetX
      let translateY = baseY + offsetY

      translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX))
      translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY))

      const rotation = isMobile ? Math.random() * 10 - 5 : Math.random() * 30 - 15

      return {
        transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
        translateX,
        translateY,
        rotation,
      }
    })
  }, [images.length, containerWidth, containerHeight])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mounted) {
      const totalDuration = (animationDelay + images.length * animationStagger + 0.8) * 1000
      const timer = setTimeout(() => {
        setAnimationComplete(true)
      }, totalDuration)
      return () => clearTimeout(timer)
    }
  }, [mounted, animationDelay, animationStagger, images.length])

  const getTransform = (idx: number): string => {
    return randomTransforms[idx]?.transform || "none"
  }

  const getViewportCenterY = (idx: number): number => {
    if (!containerRef.current) return -randomTransforms[idx].translateY

    const rect = containerRef.current.getBoundingClientRect()
    const containerCenterY = rect.top + rect.height / 2
    const viewportCenterY = window.innerHeight / 2
    const offsetY = viewportCenterY - containerCenterY

    return offsetY - randomTransforms[idx].translateY
  }

  return (
    <div
      ref={containerRef}
      className={`bounceCardsContainer ${className} max-w-full overflow-hidden`}
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight,
        maxWidth: "100%",
      }}
    >
      {images.map((src, idx) => (
        <motion.div
          key={idx}
          className={`card card-${idx} ${mounted ? "card-mounted" : ""}`}
          style={{
            ["--final-transform" as any]: getTransform(idx),
            transform: animationComplete ? getTransform(idx) : undefined,
            animationDelay: `${animationDelay + idx * animationStagger}s`,
          }}
          onHoverStart={() => enableHover && setHoveredIndex(idx)}
          onHoverEnd={() => enableHover && setHoveredIndex(null)}
          animate={{
            opacity: hoveredIndex !== null && hoveredIndex !== idx ? 0.3 : 1,
          }}
          whileHover={
            enableHover
              ? {
                  width: 400,
                  height: 400,
                  rotate: -randomTransforms[idx].rotation,
                  x: (containerWidth * 2) / 3 - randomTransforms[idx].translateX,
                  y: getViewportCenterY(idx),
                  zIndex: 50,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  },
                }
              : undefined
          }
        >
          <img className="image" src={src || "/placeholder.svg"} alt={`card-${idx}`} loading="lazy" decoding="async" />
        </motion.div>
      ))}
    </div>
  )
}

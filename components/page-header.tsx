"use client"

import { useEffect, useState, useRef } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundAlt?: string
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
}

export function PageHeader({ title, subtitle, backgroundImage, backgroundAlt }: PageHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const signRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-[300px] flex items-center overflow-visible bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-balance mb-4 text-black">
              {decodeHtmlEntities(title)}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-pretty max-w-2xl text-muted-foreground">
                {decodeHtmlEntities(subtitle)}
              </p>
            )}
          </div>

          {backgroundImage && (
            <div className="flex-shrink-0 relative">
              <div
                ref={signRef}
                className="relative w-48 h-56 md:w-56 md:h-64 lg:w-64 lg:h-72 rounded-lg overflow-hidden shadow-2xl"
                style={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt={backgroundAlt || title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 border-4 border-amber-900/20 pointer-events-none rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { MegaMenuWrapper } from "./mega-menu-wrapper"
import { cn } from "@/lib/utils"
import type { SiteOptions } from "@/lib/wordpress-api"
import Image from "next/image"

export function Header({ siteOptions }: { siteOptions?: SiteOptions | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.classList.add("megamenu-open")
      document.documentElement.classList.add("megamenu-open")
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.body.classList.remove("megamenu-open")
        document.documentElement.classList.remove("megamenu-open")
      }
    } else {
      document.body.classList.remove("megamenu-open")
      document.documentElement.classList.remove("megamenu-open")
    }
  }, [isMenuOpen])

  const handleNavigation = () => {
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" onClick={handleNavigation} className="flex items-center gap-3 group">
            {siteOptions?.logo_du_site?.url ? (
              <div className="relative h-10 w-10">
                <Image
                  src={siteOptions.logo_du_site.url || "/placeholder.svg"}
                  alt={siteOptions.logo_du_site.alt || "Logo"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center h-10 w-10 rounded border-2 border-primary transition-colors group-hover:border-primary/70">
                <svg
                  className="h-6 w-6 text-primary transition-colors group-hover:text-primary/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            )}
            <span className="text-lg font-light tracking-wide">
              château de
              <br />
              goutelas
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              onClick={handleNavigation}
              className="text-sm font-light uppercase tracking-wider transition-colors hover:text-primary"
            >
              Accueil
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1 text-sm font-light uppercase tracking-wider transition-colors hover:text-primary"
              >
                menu
                <svg
                  className={cn("h-4 w-4 transition-transform", isMenuOpen && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMenuOpen && <MegaMenuWrapper />}
            </div>

            <Link
              href="/agenda"
              onClick={handleNavigation}
              className="text-sm font-light uppercase tracking-wider transition-colors hover:text-primary"
            >
              agenda
            </Link>
          </nav>

          <button className="md:hidden p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

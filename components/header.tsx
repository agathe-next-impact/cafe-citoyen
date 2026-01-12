"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
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

  console.log("siteOptions", siteOptions);

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" onClick={handleNavigation} className="flex items-center gap-3 group">
            {siteOptions?.logo_du_site?.url &&
              <div className="relative h-10 w-10">
                <Image
                  src={siteOptions.logo_du_site.url || ""}
                  alt={siteOptions.logo_du_site.alt || "Logo"}
                  fill
                  className="object-contain"
                />
              </div>
             }
          </Link>

          <nav className="hidden md:flex items-center gap-8">
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

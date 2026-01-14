"use client"


import type React from "react"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getSiteOptions } from "@/lib/wordpress-api"

type NavLink = {
  label: string
  href: string
}

export type NavItem = {
  label: string
  bgColor: string
  textColor: string
  links: NavLink[]
}

export interface AnimatedNavProps {
  logo: string
  items: NavItem[]
  className?: string
  baseColor?: string
  menuColor?: string
  agendaLink?: string
}

const logo = getSiteOptions().then((options) => {
  if (options?.logo_du_site?.url) {
    return (
      <img
        src={options.logo_du_site.url}
        alt={options.logo_du_site.alt || "Logo"}
        className="h-20 w-20 object-cover rounded"
        style={{ aspectRatio: '1 / 1' }}
      />
    );
  } else {
    return (
      <div className="relative flex items-center justify-center h-10 w-10 rounded border-2 border-primary transition-colors group-hover:border-primary/70">
        <svg
          className="h-6 w-6 text-primary transition-colors group-hover:text-primary/70"
          fill="none"
          stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    );
  }
})

export function AnimatedNav({
  items,
  className = "",
  baseColor = "oklch(var(--background))",
  menuColor = "oklch(var(--foreground))",
  agendaLink = "/agenda",
}: AnimatedNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Association couleur Tailwind <-> image décorative
  const colorImageMap = [
    { bgClass: 'bg-purple-50', img: '/images/fichier-203-404x-2.png' },
    { bgClass: 'bg-red-50', img: '/images/fichier-205-404x-4.png' },
    { bgClass: 'bg-yellow-50', img: '/images/fichier-201-404x-1.png' },
    { bgClass: 'bg-emerald-50', img: '/images/fichier-204-404x-3.png' },
    { bgClass: 'bg-blue-50', img: '/images/fichier-202-404x-2.png' },
  ];

  const toggleMenu = () => {
    setIsExpanded(!isExpanded)
  }

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" })
    setIsExpanded(false)
  }

  const toggleCard = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full bg-white", className)}>
      {/* Overlay to prevent page interaction and stacking issues when menu is open */}
      {isExpanded && (
        <div className="fixed inset-0 z-199 bg-white/20 backdrop-blur-xl transition-all duration-300" aria-hidden="true" />
      )}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-200 transition-all duration-300 max-h-20 backdrop-blur-lg border-b border-blue-100",
          isScrolled ? "bg-[var(--background)/0.95]" : `bg-[${baseColor}/0.8]`,
        )}
      >
        <div className="container mx-auto max-w-full overflow-x-hidden">
          <div className="flex items-start justify-between pt-4 px-4">
            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className={cn(
                "tracking-wider hover:shadow-md bg-blue-500 hover:bg-blue-500/90 rounded-full mt-2 ml-2 px-4 py-2 shadow-sm gap-1.5 relative z-110 cursor-pointer transition-all",
                isExpanded && "gap-0",
              )}
              aria-label={isExpanded ? "Fermer le menu" : "Ouvrir le menu"}
              style={{ color: menuColor }}
            >
            <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 items-center text-white">
              <span
                className={cn(
                  "block h-0.5 w-6 bg-current transition-all duration-300",
                  isExpanded && "rotate-45 translate-y-0.5",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-6 bg-current transition-all duration-300",
                  isExpanded && "-rotate-45 -translate-y-0.5",
                )}
              />
              </div>
              <span className="text-sm font-semibold uppercase text-white tracking-wider transition-all">
                MENU 
              </span>
              </div>
            </button>

            {/* Logo */}
            <Link href="/" onClick={handleLinkClick} className="flex items-center">
              {logo}
            </Link>

            {/* Agenda Link */}
            <Link
              href={agendaLink}
              onClick={handleLinkClick}
              className="text-sm font-semibold uppercase tracking-wider transition-all hover:shadow-md bg-emerald-600 hover:bg-emerald-600/90 text-white rounded-full mt-2 mr-2 px-4 py-2 shadow-sm relative z-110"
            >
              Agenda
            </Link>
          </div>
        </div>

        {/* Megamenu déroulant animé avec framer-motion */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={cn(
                "overflow-hidden -mt-14",
              )}
            >
              <div className="relative">
                <div className="container mx-auto mt-8 px-4 lg:px-8 py-4 max-w-full overflow-x-hidden max-h-[calc(100vh-5rem)] lg:overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
                    {(items || []).map((item, idx) => {
                      const bgClass = colorImageMap[idx % colorImageMap.length]?.bgClass || 'bg-yellow-100';
                      const imgSrc = colorImageMap[idx % colorImageMap.length]?.img || '/placeholder.svg';
                      return (
                        <div
                          key={`${item.label}-${idx}`}
                          className={cn(
                            "rounded-xl flex flex-col transition-all duration-500 ease-out relative",
                            "lg:min-h-45 border border-blue-100 backdrop-blur-md",
                            expandedCardIndex === idx ? "min-h-45" : "min-h-15 lg:min-h-45",
                            isExpanded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                            item.label === ""
                              ? "items-center justify-center p-2"
                              : expandedCardIndex === idx
                                ? "p-6"
                                : "p-3 lg:p-6",
                            "max-w-full",
                            bgClass,
                          )}
                          style={{
                            color: item.textColor,
                            transitionDelay: `${idx * 80}ms`,
                            overflow: "visible",
                          }}
                        >
                          {item.label === "" && idx === items.length - 1 ? (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                              <div className="w-full h-full flex items-center justify-center">{logo}</div>
                            </div>
                          ) : <>
                              <div className="lg:hidden">
                                <button
                                  onClick={(e) => toggleCard(idx, e)}
                                  className="text-base font-bold mb-2 text-left w-full hover:underline underline-offset-4 transition-all relative z-10 flex items-center justify-between"
                                >
                                  {item.label}
                                  <svg
                                    className={cn(
                                      "h-5 w-5 transition-transform duration-300",
                                      expandedCardIndex === idx && "rotate-180",
                                    )}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                              <div className="hidden lg:block">
                                <Link
                                  href={item.links?.[0]?.href || "/"}
                                  onClick={handleLinkClick}
                                  className="text-lg font-bold mb-4 hover:underline underline-offset-4 transition-all relative z-10"
                                >
                                  {item.label}
                                </Link>
                              </div>
                              <div
                                className={cn(
                                  "flex flex-col gap-3 flex-1 relative z-10 transition-all duration-300 overflow-hidden",
                                  "lg:flex lg:max-h-full lg:opacity-100",
                                  expandedCardIndex === idx
                                    ? "max-h-125 opacity-100"
                                    : "max-h-0 opacity-0 lg:max-h-full lg:opacity-100",
                                )}
                              >
                                <Link
                                  href={item.links?.[0]?.href || "/"}
                                  onClick={handleLinkClick}
                                  className="group flex items-center gap-2 transition-all hover:translate-x-1 font-semibold lg:hidden"
                                  style={{ fontSize: "16px" }}
                                >
                                  <svg
                                    className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  {item.label}
                                </Link>
                                {item.links?.slice(1).map((lnk, i) => (
                                  <Link
                                    key={`${lnk.label}-${i}`}
                                    href={lnk.href}
                                    onClick={handleLinkClick}
                                    className="group flex items-center gap-2 transition-all hover:translate-x-1"
                                    style={{ fontSize: "16px" }}
                                  >
                                    <svg
                                      className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {lnk.label}
                                  </Link>
                                ))}
                              </div>

                              {(expandedCardIndex === idx || window.innerWidth >= 1024) && (
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                                  {/* Ball 1 - 0 degrees (bottom right) */}
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="absolute"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      right: "-10px",
                                      bottom: "-10px",
                                      opacity: 0.5,
                                    }}
                                  />
                                  {/* Ball 2 - 30 degrees */}
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="absolute"
                                    style={{
                                      width: "45px",
                                      height: "45px",
                                      right: "calc(-10px + 60px * 0.866)",
                                      bottom: "calc(-10px + 60px * 0.5)",
                                      opacity: 0.55,
                                    }}
                                  />
                                  {/* Ball 3 - 60 degrees */}
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="absolute"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      right: "calc(-10px + 90px * 0.5)",
                                      bottom: "calc(-10px + 90px * 0.866)",
                                      opacity: 0.6,
                                    }}
                                  />
                                  {/* Ball 4 - 90 degrees (directly above) */}
                                  <img
                                    src={imgSrc}
                                    alt=""
                                    className="absolute"
                                    style={{
                                      width: "35px",
                                      height: "35px",
                                      right: "-10px",
                                      bottom: "calc(-10px + 110px)",
                                      opacity: 0.65,
                                    }}
                                  />
                                </div>
                              )}
                            </>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
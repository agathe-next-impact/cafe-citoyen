"use client"


import type React from "react"
import { useState, useEffect } from "react"
import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { decodeHtmlEntities } from "@/components/wp-decode"


// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

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
  logo?: string
  items: NavItem[]
  className?: string
  baseColor?: string
  menuColor?: string
  agendaLink?: string
  reseaux_sociaux?: Array<{
    icone?:
      | {
          url: string
          alt: string
          title: string
          ID: number
        }
      | Array<{
          url: string
          alt: string
          title: string
          ID: number
        }>
    lien?: string
  }>
}

export function AnimatedNav({
  logo,
  items,
  className,
  baseColor = "oklch(var(--background))",
  menuColor = "oklch(var(--foreground))",
  agendaLink = "/agenda",
  reseaux_sociaux = [],
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

  const validItems = (items || []).filter(item => (item.links && item.links.length > 1));

  return (
    <LazyMotion features={domAnimation}>
    <div className={cn("w-full", className)}>
      {/* Overlay to prevent page interaction and stacking issues when menu is open */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-white/5 backdrop-blur-xl transition-all duration-300 z-50 cursor-pointer" 
          aria-hidden="true"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-200 transition-all duration-300 max-h-20 border-y-2 border-black",
          isScrolled ? "bg-[var(--background)/0.1]" : `bg-[${baseColor}/0.1]`,
        )}
      >

        <div className="bg-black container mx-auto max-w-full overflow-x-hidden">
          <div className="flex items-center justify-between">
            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className={cn(
                "min-w-34 tracking-wider hover:shadow-md bg-black hover:bg-black/90 px-6 py-2 border-r-2 border-white gap-1.5 relative z-110 cursor-pointer transition-all",
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
            <Link href="/" onClick={handleLinkClick} className="w-20 absolute top-9 left-0">
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo"
                  width={80}
                  height={80}
                  fetchPriority="high"
                  className="h-20 w-20 object-contain"
                  style={{ height: 'auto', width: 'auto' }}
                />
              ) : (
                <Image
                  src="/logo-cafe-citoyen.png"
                  alt="Café Citoyen"
                  width={80}
                  height={80}
                  fetchPriority="high"
                  className="h-20 w-20 object-contain"
                  style={{ height: 'auto', width: 'auto' }}
                />
              )}
            </Link>


            <div className="flex items-center">
            <Link
              href="/visiter"
              onClick={handleLinkClick}
              className="text-sm font-semibold uppercase tracking-wider transition-all hover:shadow-md bg-black hover:bg-black/90 text-white border-r-2 border-white px-9 py-2 relative z-110"
              aria-label="Accueil"
            >
              Visiter
            </Link>
            {/* Agenda Link */}
            <Link
              href={agendaLink}
              onClick={handleLinkClick}
              className="text-sm font-semibold uppercase tracking-wider transition-all hover:shadow-md bg-black hover:bg-black/90 text-white px-9 py-2 relative z-110"
            >
              Agenda
            </Link>
            </div>

          </div>
        </div>

          {/* Réseaux sociaux */}                  
            <div 
              className="absolute top-9 right-0 w-10 h-34 bg-black"
            />    
            
            <div className="absolute top-9 right-0 flex flex-col gap-4 px-2 pb-2 pt-4">
              {reseaux_sociaux && reseaux_sociaux.length > 0 && (
                  reseaux_sociaux.map((reseau, idx) => {
                    const icone = Array.isArray(reseau.icone) ? reseau.icone[0] : reseau.icone

                    return (
                      reseau.lien && icone?.url && (
                        <a
                          key={idx}
                          href={reseau.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={icone?.alt || "Lien réseau social"}
                        >
                          <Image
                            src={icone.url}
                            alt={icone.alt || ""}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                        </a>
                      )
                    )
                  })
              )}
            </div>

        {/* Megamenu déroulant animé avec framer-motion */}
        <AnimatePresence>
          {isExpanded && (
            <m.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={cn(
                "overflow-hidden",
              )}
            >
              <div className="relative">
                <div 
                  className="bg-white/5 backdrop-blur-md container mx-auto px-4 lg:px-8 max-w-full overflow-x-hidden h-screen lg:overflow-visible cursor-pointer"
                  onClick={() => setIsExpanded(false)}
                >
                  <m.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 pt-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isExpanded ? "visible" : "hidden"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {validItems.map((item, idx) => {
                      const bgClass = colorImageMap[idx % colorImageMap.length]?.bgClass || 'bg-yellow-100';
                      const imgSrc = colorImageMap[idx % colorImageMap.length]?.img || '/placeholder.svg';
                      return (
                        <m.div
                          key={`${item.label}-${idx}`}
                          variants={cardVariants}
                          className={cn(
                            "flex flex-col transition-all duration-500 ease-out relative",
                            "lg:min-h-45 border border-white backdrop-blur-md",
                            expandedCardIndex === idx ? "min-h-45" : "min-h-15 lg:min-h-45",
                            expandedCardIndex === idx
                                ? "p-6"
                                : "p-3 lg:p-6",
                            "max-w-full",
                            bgClass,
                          )}
                          style={{
                            color: item.textColor,
                            overflow: "visible",
                          }}
                        >
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
                                  {decodeHtmlEntities(item.label)}
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
                                  {decodeHtmlEntities(item.label)}
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
                                    {decodeHtmlEntities(lnk.label)}
                                  </Link>
                                ))}
                              </div>

                              {(expandedCardIndex === idx || window.innerWidth >= 1024) && (
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                                  {/* Ball 1 - 0 degrees (bottom right) */}
                                  <Image
                                    src={imgSrc}
                                    alt=""
                                    width={50}
                                    height={50}
                                    className="absolute"
                                    fetchPriority="high"
                                    style={{
                                      right: "-10px",
                                      bottom: "-10px",
                                      opacity: 0.5,
                                    }}
                                  />
                                  {/* Ball 2 - 30 degrees */}
                                  <Image
                                    src={imgSrc}
                                    alt=""
                                    width={45}
                                    height={45}
                                    className="absolute"
                                    fetchPriority="high"
                                    style={{
                                      right: "calc(-10px + 60px * 0.866)",
                                      bottom: "calc(-10px + 60px * 0.5)",
                                      opacity: 0.55,
                                    }}
                                  />
                                  {/* Ball 3 - 60 degrees */}
                                  <Image
                                    src={imgSrc}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="absolute"
                                    fetchPriority="high"
                                    style={{
                                      right: "calc(-10px + 90px * 0.5)",
                                      bottom: "calc(-10px + 90px * 0.866)",
                                      opacity: 0.6,
                                    }}
                                  />
                                  {/* Ball 4 - 90 degrees (directly above) */}
                                  <Image
                                    src={imgSrc}
                                    alt=""
                                    width={35}
                                    height={35}
                                    className="absolute"
                                    fetchPriority="high"
                                    style={{
                                      right: "-10px",
                                      bottom: "calc(-10px + 110px)",
                                      opacity: 0.65,
                                    }}
                                  />
                                </div>
                              )}
                        </m.div>
                      );
                    })}
                  </m.div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
    </LazyMotion>
  );
}
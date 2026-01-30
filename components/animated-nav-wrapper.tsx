"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import Image from "next/image"
import type { NavItem } from "./animated-nav"
import {
  getWordPressPages,
  organizePagesByParent,
  getSiteOptions,
  getWordPressEvents,
  type SiteOptions,
  type WordPressEvent,
} from "@/lib/wordpress-api"

// Lazy load du composant AnimatedNav (réduit le bundle initial de ~200KB)
const AnimatedNav = lazy(() => import("./animated-nav").then(mod => ({ default: mod.AnimatedNav })))

export function AnimatedNavWrapper() {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [siteOptions, setSiteOptions] = useState<SiteOptions | null>(null)
  const [latestEvents, setLatestEvents] = useState<WordPressEvent[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [pages, options, events] = await Promise.all([
          getWordPressPages(),
          getSiteOptions(),
          getWordPressEvents(),
        ])

        if (options) {
          setSiteOptions(options)
          console.log('Site options reçues:', options)
          console.log('Réseaux sociaux:', options.reseaux_sociaux)
        }

        const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setLatestEvents(sortedEvents.slice(0, 3)) // Keep top 3 events

        if (pages.length > 0) {
          const organized = organizePagesByParent(pages)

          // Couleurs -100 pour chaque carte (ordre : jaune, rouge, jaune, bleu, émeraude, violet)
          const cardColors = [
            'yellow-100', // carte 1
            'red-100',    // carte 2
            'yellow-100', // carte 3
            'blue-100',   // carte 4
            'emerald-100',// carte 5
            'violet-100', // carte 6
          ];
          const items: NavItem[] = organized.map((section, idx) => ({
            label: section.parent,
            bgColor: cardColors[idx] || 'gray-100',
            textColor: 'oklch(0.25 0.02 85)',
            links: [
              {
                label: `Voir ${section.parent}`,
                href: section.parentHref,
              },
              ...section.pages.map((page) => ({
                label: page.title,
                href: page.href,
              })),
            ],
          }))

          // Suppression de l'ajout des cartes événements dans le megamenu
          while (items.length < 6) {
            items.push({
              label: "",
              bgColor: "white",
              textColor: "oklch(0.25 0.02 85)",
              links: [],
            })
          }

          setNavItems(items)
        }
      } catch (error) {
        console.error("Error fetching menu data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || navItems.length === 0) {
    return null
  }
  console.log('Rendu AnimatedNav avec les items:', siteOptions)

  return (
    <div className="relative z-100">      
      <Suspense fallback={<div className="h-20 bg-black" />}>
        <AnimatedNav
          logo={siteOptions?.logo_du_site?.url || ""}
          items={navItems}
          agendaLink="/agenda"
          reseaux_sociaux={siteOptions?.reseaux_sociaux || []}
        />
      </Suspense>
    </div>
  )
}

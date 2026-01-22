"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatedNav, type NavItem } from "./animated-nav"
import {
  getWordPressPages,
  organizePagesByParent,
  getSiteOptions,
  getWordPressEvents,
  type SiteOptions,
  type WordPressEvent,
} from "@/lib/wordpress-api"
import { Link } from "lucide-react"

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

  return (
    <div className="relative z-100">      
      <AnimatedNav
        logo={siteOptions?.logo_du_site?.url || ""}
        items={navItems}
        agendaLink="/agenda"
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatedNav } from "./animated-nav"
import type { NavItem } from "./animated-nav"
import {
  type SiteOptions,
  type WordPressEvent,
} from "@/lib/wordpress-api"

export function AnimatedNavWrapper({ siteOptions }: { siteOptions: SiteOptions | null }) {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [latestEvents, setLatestEvents] = useState<WordPressEvent[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [pagesRes, eventsRes] = await Promise.all([
          fetch("/api/wordpress/pages"),
          fetch("/api/wordpress/events"),
        ])

        const organized = await pagesRes.json()
        const events: WordPressEvent[] = await eventsRes.json()

        const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setLatestEvents(sortedEvents.slice(0, 3)) // Keep top 3 events

        if (organized.length > 0) {

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
      }
    }

    fetchData()
  }, [])

  return (
    <div className="absolute z-100">      
      <AnimatedNav
        logo={siteOptions?.logo_du_site?.url || ""}
        items={navItems}
        agendaLink="/la-programmation"
        reseaux_sociaux={siteOptions?.reseaux_sociaux ?? []}
      />
    </div>
  )
}

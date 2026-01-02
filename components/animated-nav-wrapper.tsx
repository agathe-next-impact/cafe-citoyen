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

          const items: NavItem[] = organized.map((section) => ({
            label: section.parent,
            bgColor: "oklch(0.93 0.02 85)",
            textColor: "oklch(0.25 0.02 85)",
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

          while (items.length < 6) {
            const eventIndex = items.length - organized.length
            const event = sortedEvents[eventIndex]

            if (event) {
              const featuredImageUrl =
                event._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                event.acf?.background?.url ||
                "/placeholder.svg"

              items.push({
                label: event.title.rendered
                  .replace(/&#8217;/g, "'")
                  .replace(/&#8220;/g, '"')
                  .replace(/&#8221;/g, '"'),
                bgColor: "white",
                textColor: "oklch(0.25 0.02 85)",
                links: [
                  {
                    label: "Voir l'événement",
                    href: `/evenement/${event.slug}`,
                  },
                ],
                isEvent: true,
                eventDate: event.acf?.date_de_debut || event.date,
                eventImage: featuredImageUrl,
              })
            } else {
              items.push({
                label: "",
                bgColor: "white",
                textColor: "oklch(0.25 0.02 85)",
                links: [],
              })
              break
            }
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
    <div className="relative z-[100]">
      <AnimatedNav
        logo={
          <div className="flex items-center gap-3 group">
            {siteOptions?.logo_du_site?.url ? (
              <div className="relative h-full w-full">
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
          </div>
        }
        items={navItems}
        agendaLink="/agenda"
      />
    </div>
  )
}

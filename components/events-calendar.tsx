"use client"

import { useEffect, useState } from "react"
import type { WordPressEvent } from "@/lib/wordpress-api"

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea")
  textarea.innerHTML = text
  return textarea.value
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function extractTextFromHtml(html: string): string {
  const textarea = document.createElement("textarea")
  textarea.innerHTML = html
  const text = textarea.value
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, "").trim()
}

export function EventsCalendar() {
  const [events, setEvents] = useState<WordPressEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/wordpress/events")
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
          console.log("[v0] Fetched events from API:", data.length)
        }
      } catch (error) {
        console.error("[v0] Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Chargement des événements...</p>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="py-24 px-6 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="mt-4 text-lg text-muted-foreground">Aucun événement disponible pour le moment</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-balance mb-4">Agenda & Événements</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Découvrez les prochains événements et activités
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-2xl font-light text-primary">{new Date(event.date).getDate()}</span>
                    <span className="text-xs text-primary uppercase">
                      {new Intl.DateTimeFormat("fr-FR", {
                        month: "short",
                      }).format(new Date(event.date))}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light mb-2 text-balance">{decodeHtmlEntities(event.title.rendered)}</h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.acf?.lieu && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{event.acf.lieu}</span>
                    </div>
                  )}
                </div>

                {event.excerpt?.rendered && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 text-pretty">
                    {extractTextFromHtml(event.excerpt.rendered)}
                  </p>
                )}

                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  En savoir plus
                  <span className="ml-1">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

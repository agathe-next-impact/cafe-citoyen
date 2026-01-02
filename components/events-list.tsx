"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { EventsFilters } from "./events-filters"
import { SiteCard } from "./ui/site-card"
import { getCategoryVariant } from "@/lib/category-colors"

interface Event {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  excerpt?: { rendered: string }
  acf?: {
    recurrent_ou_ponctuel?: boolean
    date_de_debut?: string
    date_de_fin?: string
    heure_de_debut?: string
    heure_de_fin?: string
    jour?: string
    heure?: string
    duree_en_heures?: string
    debut_de_periode?: string
    fin_de_periode?: string
    descriptif?: string
    images?: Array<{ url?: string; alt?: string }>
    partenaires_details?: Array<{ id: number; title: string; link: string }>
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>
    "wp:term"?: Array<Array<{ id: number; name: string; taxonomy: string }>>
  }
}

interface EventsListProps {
  events: Event[]
  categories: string[]
  seasons: string[]
  partners: string[]
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

function parseFrenchDate(dateString: string): Date | null {
  if (!dateString) return null
  const parts = dateString.split("/")
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  return new Date(year, month - 1, day)
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
}

function getEventStatus(
  dateDebut: Date | null,
  dateFin: Date | null,
): { status: "upcoming" | "current" | "past"; color: string; bgColor: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!dateDebut) {
    return { status: "upcoming", color: "text-primary", bgColor: "from-primary to-primary/80" }
  }

  const startDate = new Date(dateDebut)
  startDate.setHours(0, 0, 0, 0)

  const endDate = dateFin ? new Date(dateFin) : new Date(dateDebut)
  endDate.setHours(23, 59, 59, 999)

  if (endDate < today) {
    return { status: "past", color: "text-muted-foreground", bgColor: "from-muted to-muted/80" }
  }

  if (startDate <= today && endDate >= today) {
    return { status: "current", color: "text-secondary", bgColor: "from-secondary to-secondary/80" }
  }

  return { status: "upcoming", color: "text-primary", bgColor: "from-primary to-primary/80" }
}

export const EventsList = memo(function EventsList({ events, categories, seasons, partners }: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSeason, setSelectedSeason] = useState("")
  const [selectedPartner, setSelectedPartner] = useState("")

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value)
  }, [])

  const handleSeasonChange = useCallback((value: string) => {
    setSelectedSeason(value)
  }, [])

  const handlePartnerChange = useCallback((value: string) => {
    setSelectedPartner(value)
  }, [])

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events]

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          decodeHtmlEntities(event.title.rendered).toLowerCase().includes(search) ||
          (event.excerpt?.rendered && extractTextFromHtml(event.excerpt.rendered).toLowerCase().includes(search)) ||
          (event.acf?.descriptif && extractTextFromHtml(event.acf.descriptif).toLowerCase().includes(search)),
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((event) =>
        event._embedded?.["wp:term"]
          ?.flat()
          .some((term) => term.taxonomy === "category" && decodeHtmlEntities(term.name) === selectedCategory),
      )
    }

    // Filter by season
    if (selectedSeason) {
      filtered = filtered.filter((event) =>
        event._embedded?.["wp:term"]
          ?.flat()
          .some((term) => term.taxonomy === "saison-culturelle" && decodeHtmlEntities(term.name) === selectedSeason),
      )
    }

    // Filter by partner
    if (selectedPartner) {
      filtered = filtered.filter((event) =>
        event.acf?.partenaires_details?.some((p) => decodeHtmlEntities(p.title) === selectedPartner),
      )
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      const dateA = a.acf?.date_de_debut ? parseFrenchDate(a.acf.date_de_debut) : new Date(a.date)
      const dateB = b.acf?.date_de_debut ? parseFrenchDate(b.acf.date_de_debut) : new Date(b.date)

      if (!dateA || !dateB) return 0
      return dateB.getTime() - dateA.getTime()
    })

    return filtered
  }, [events, searchTerm, selectedCategory, selectedSeason, selectedPartner])

  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Filters */}
        <div className="mb-12">
          <EventsFilters
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSeasonChange={handleSeasonChange}
            onPartnerChange={handlePartnerChange}
            categories={categories}
            seasons={seasons}
            partners={partners}
          />
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {filteredAndSortedEvents.length} événement{filteredAndSortedEvents.length !== 1 ? "s" : ""} trouvé
          {filteredAndSortedEvents.length !== 1 ? "s" : ""}
        </div>

        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-lg text-muted-foreground">Aucun événement trouvé avec ces critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedEvents.map((event) => {
              const isPonctuel = event.acf?.recurrent_ou_ponctuel
              const dateDebut = event.acf?.date_de_debut
                ? parseFrenchDate(event.acf.date_de_debut)
                : new Date(event.date)
              const dateFin = event.acf?.date_de_fin ? parseFrenchDate(event.acf.date_de_fin) : null

              const saisonCulturelle = event._embedded?.["wp:term"]
                ?.flat()
                .filter((term) => term.taxonomy === "saison-culturelle")

              const category = event._embedded?.["wp:term"]?.flat().find((term) => term.taxonomy === "category")

              const categoryName = category ? decodeHtmlEntities(category.name) : undefined
              const variant = getCategoryVariant(categoryName)

              const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url
              const firstGalleryImage = event.acf?.images?.[0]?.url

              return (
                <SiteCard
                  key={event.id}
                  variant={variant}
                  title={decodeHtmlEntities(event.title.rendered)}
                  description={
                    event.acf?.descriptif
                      ? extractTextFromHtml(decodeHtmlEntities(event.acf.descriptif.substring(0, 200) + "..."))
                      : event.excerpt?.rendered
                        ? extractTextFromHtml(decodeHtmlEntities(event.excerpt.rendered))
                        : undefined
                  }
                  image={featuredImage || firstGalleryImage}
                  href={`/evenement/${event.slug}`}
                  category={categoryName}
                  date={isPonctuel ? event.acf?.date_de_debut : event.acf?.jour}
                />
              )
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 py-16 px-6 bg-muted/30 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-4">Ne manquez aucun événement</h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              <span>S'inscrire</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
})

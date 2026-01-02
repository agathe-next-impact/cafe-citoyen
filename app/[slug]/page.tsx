import { notFound } from "next/navigation"
import {
  getWordPressPageBySlug,
  getAllPageSlugs,
  getEventsByPageSlug,
  getWordPressEvents,
  getWordPressPages,
  getTeamMembers,
  getWordPressPosts, // Added posts import
  getPartners, // Added getPartners import
} from "@/lib/wordpress-api"
import Link from "next/link"
import { EventsList } from "@/components/events-list"
import PageHeader from "@/components/page-header"
import { TeamMembers } from "@/components/team-members" // Added team members component
import { PostsList } from "@/components/posts-list" // Added posts list component
import { PartnersList } from "@/components/partners-list"
import { PageContent } from "@/components/page-content" // Added PageContent component import

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

export async function generateStaticParams() {
  const RESERVED_ROUTES = ["evenement", "api", "not-found", "_next", "favicon.ico"]
  const slugs = await getAllPageSlugs()
  const filteredSlugs = slugs.filter((slug) => !RESERVED_ROUTES.includes(slug))
  return filteredSlugs.map((slug) => ({ slug }))
}

export const dynamicParams = false
export const revalidate = 3600 // Added ISR with 1 hour revalidation

function getEventStatus(event: any): "upcoming" | "ongoing" | "past" {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (event.acf?.recurrent_ou_ponctuel) {
    if (event.acf.date_de_debut) {
      const [day, month, year] = event.acf.date_de_debut.split("/")
      const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      startDate.setHours(0, 0, 0, 0)

      if (event.acf.date_de_fin) {
        const [endDay, endMonth, endYear] = event.acf.date_de_fin.split("/")
        const endDate = new Date(Number.parseInt(endYear), Number.parseInt(endMonth) - 1, Number.parseInt(endDay))
        endDate.setHours(23, 59, 59, 999)

        if (today < startDate) return "upcoming"
        if (today <= endDate) return "ongoing"
        return "past"
      }

      if (today.getTime() === startDate.getTime()) return "ongoing"
      return today < startDate ? "upcoming" : "past"
    }
  }

  return "upcoming"
}

function getStatusColor(status: "upcoming" | "ongoing" | "past") {
  switch (status) {
    case "upcoming":
      return "bg-primary text-primary-foreground"
    case "ongoing":
      return "bg-secondary text-secondary-foreground animate-pulse"
    case "past":
      return "bg-muted text-muted-foreground"
  }
}

function getStatusText(status: "upcoming" | "ongoing" | "past") {
  switch (status) {
    case "upcoming":
      return "À venir"
    case "ongoing":
      return "En cours"
    case "past":
      return "Terminé"
  }
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

function EventsLoading() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/50 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

async function EventsContent() {
  const events = await getWordPressEvents()

  const categories = Array.from(
    new Set(
      events.flatMap(
        (event) =>
          event._embedded?.["wp:term"]
            ?.flat()
            .filter((term) => term.taxonomy === "category")
            .map((term) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  ).sort()

  const seasons = Array.from(
    new Set(
      events.flatMap(
        (event) =>
          event._embedded?.["wp:term"]
            ?.flat()
            .filter((term) => term.taxonomy === "saison-culturelle")
            .map((term) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  ).sort()

  const partners = Array.from(
    new Set(
      events.flatMap(
        (event) => event.acf?.partenaires_details?.map((p: { title: string }) => decodeHtmlEntities(p.title)) || [],
      ),
    ),
  ).sort()

  return <EventsList events={events} categories={categories} seasons={seasons} partners={partners} />
}

async function getChildPages(parentId: number) {
  const allPages = await getWordPressPages()
  return allPages.filter((page) => page.parent === parentId).sort((a, b) => a.menu_order - b.menu_order)
}

async function getAgendaData() {
  const [page, allEvents] = await Promise.all([getWordPressPageBySlug("agenda"), getWordPressEvents()])

  if (!page) return null

  const categories = Array.from(
    new Set(
      allEvents.flatMap(
        (event) =>
          event._embedded?.["wp:term"]
            ?.flat()
            .filter((term) => term.taxonomy === "category")
            .map((term) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  ).sort()

  const seasons = Array.from(
    new Set(
      allEvents.flatMap(
        (event) =>
          event._embedded?.["wp:term"]
            ?.flat()
            .filter((term) => term.taxonomy === "saison-culturelle")
            .map((term) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  ).sort()

  const partners = Array.from(
    new Set(
      allEvents.flatMap(
        (event) => event.acf?.partenaires_details?.map((p: { title: string }) => decodeHtmlEntities(p.title)) || [],
      ),
    ),
  ).sort()

  return { page, allEvents, categories, seasons, partners }
}

export default async function WordPressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (slug === "agenda") {
    const agendaData = await getAgendaData()

    if (!agendaData) {
      notFound()
      return null
    }

    const { page, allEvents, categories, seasons, partners } = agendaData

    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
        />

        <PageContent content={page.acf?.contenu} images={page.acf?.images} />

        <div className="container mx-auto px-4 py-12">
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto mb-12">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}

          <EventsList events={allEvents} categories={categories} seasons={seasons} partners={partners} />
        </div>
      </div>
    )
  }

  const page = await getWordPressPageBySlug(slug)

  if (!page) {
    notFound()
    return null
  }

  const childPages = await getChildPages(page.id)
  const events = await getEventsByPageSlug(slug)

  if (slug === "actualites") {
    const allPosts = await getWordPressPosts()

    const categories = Array.from(
      new Set(
        allPosts.flatMap(
          (post) =>
            post._embedded?.["wp:term"]
              ?.flat()
              .filter((term) => term.taxonomy === "category")
              .map((term) => decodeHtmlEntities(term.name)) || [],
        ),
      ),
    ).sort()

    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
        />

        <PageContent content={page.acf?.contenu} images={page.acf?.images} />

        <div className="container mx-auto px-4 py-12">
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto mb-12">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}

          <PostsList posts={allPosts} categories={categories} />
        </div>
      </div>
    )
  }

  if (slug === "equipe") {
    const teamMembers = await getTeamMembers()

    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
        />

        <PageContent content={page.acf?.contenu} images={page.acf?.images} />

        <div className="container mx-auto px-4 py-12">
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto mb-12">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}

          <TeamMembers members={teamMembers} />
        </div>
      </div>
    )
  }

  if (slug === "partenaires") {
    const partners = await getPartners()

    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
        />

        <PageContent content={page.acf?.contenu} images={page.acf?.images} />

        <div className="container mx-auto px-4 py-12">
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto mb-12">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}

          <PartnersList partners={partners} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.["sous-titre"]}
        backgroundImage={page.acf?.background?.url}
        backgroundAlt={page.acf?.background?.alt}
      />

      <PageContent content={page.acf?.contenu} images={page.acf?.images} />

      <div className="container mx-auto px-4 py-12">
        <article className="prose prose-lg max-w-4xl mx-auto">
          <div
            className="text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content?.rendered || "" }}
          />
        </article>

        {childPages.length > 0 && (
          <section className="mt-16 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Pages associées</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {childPages.map((childPage) => (
                <Link
                  key={childPage.id}
                  href={`/${childPage.slug}`}
                  className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-border"
                >
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    {decodeHtmlEntities(childPage.title.rendered)}
                    <ArrowRightIcon className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section className="mt-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Événements associés</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const status = getEventStatus(event)
                const statusColor = getStatusColor(status)
                const statusText = getStatusText(status)
                const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url

                return (
                  <Link
                    key={event.id}
                    href={`/evenement/${event.slug}`}
                    className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {featuredImage ? (
                        <img
                          src={featuredImage || "/placeholder.svg"}
                          alt={event.title.rendered}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <CalendarIcon className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                      >
                        {statusText}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {decodeHtmlEntities(event.title.rendered)}
                      </h3>

                      {event.acf?.recurrent_ou_ponctuel ? (
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {event.acf.date_de_debut && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {event.acf.date_de_debut}
                                {event.acf.date_de_fin && ` - ${event.acf.date_de_fin}`}
                              </span>
                            </div>
                          )}
                          {event.acf.heure_de_debut && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                {event.acf.heure_de_debut}
                                {event.acf.heure_de_fin && ` - ${event.acf.heure_de_fin}`}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {event.acf?.jour && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{event.acf.jour}</span>
                            </div>
                          )}
                          {event.acf?.heure && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" />
                              <span>
                                {event.acf.heure} ({event.acf.duree_en_heures}h)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

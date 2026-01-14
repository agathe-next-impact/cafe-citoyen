// Génère le chemin complet d'une page WordPress à partir de son slug et de la hiérarchie parentale
function getPagePath(page: any, allPages: any[]): string {
  let path = page.slug;
  let current = page;
  while (current.parent) {
    const parentPage = allPages.find((p) => p.id === current.parent);
    if (!parentPage) break;
    path = `${parentPage.slug}/${path}`;
    current = parentPage;
  }
  return `/${path}`;
}
import { cookies } from "next/headers"
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
    <line x1="3" x2="21" y2="10" />
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

  const fixedEvents = events.map(e => ({
    ...e,
    acf: {
      ...e.acf,
      duree_en_heures: e.acf?.duree_en_heures !== undefined ? String(e.acf.duree_en_heures) : undefined,
    },
  }));
  return <EventsList events={fixedEvents} categories={categories} seasons={seasons} partners={partners} />
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


import { getCategoryVariant } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { variantColors } from "@/components/ui/site-card";

export default async function WordPressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("__prv")?.value === "1"

  let encadres: any = undefined;
  if (slug === "agenda") {
    const agendaData = await getAgendaData()
    if (!agendaData) {
      notFound()
      return
    }
    const { page, allEvents, categories, seasons, partners } = agendaData
    // Correction typage events (duree_en_heures)
    const fixedEvents = allEvents.map(e => ({
      ...e,
      acf: {
        ...e.acf,
        duree_en_heures: e.acf?.duree_en_heures !== undefined ? String(e.acf.duree_en_heures) : undefined,
      },
    }));
    const fixedImages = Array.isArray(page.acf?.images)
      ? page.acf.images.map(img => ({ ...img, height: 0, width: 0 }))
      : undefined;
    encadres = page.acf?.encadres;

    // Séparer les événements à venir et passés, trier les à venir par date croissante
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    };
    const upcomingEvents = fixedEvents.filter(e => {
      const d = parseDate(e.acf?.date_de_debut);
      return d && d >= now;
    }).sort((a, b) => {
      const da = parseDate(a.acf?.date_de_debut);
      const db = parseDate(b.acf?.date_de_debut);
      return (da?.getTime() || 0) - (db?.getTime() || 0);
    });
    const pastEvents = fixedEvents.filter(e => {
      const d = parseDate(e.acf?.date_de_debut);
      return !d || d < now;
    }).sort((a, b) => {
      const da = parseDate(a.acf?.date_de_debut);
      const db = parseDate(b.acf?.date_de_debut);
      return (db?.getTime() || 0) - (da?.getTime() || 0);
    });

    return (
      <div className="min-h-screen bg-background pt-8">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
        />
        <PageContent content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
        <div className="container mx-auto px-4 py-12">
          {/* Grille des événements à venir */}
          {upcomingEvents.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">Événements à venir</h2>
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {upcomingEvents.map((event) => {
                  const cat = event._embedded?.["wp:term"]?.flat().find(term => term.taxonomy === "category");
                  const categoryName = cat ? decodeHtmlEntities(cat.name) : undefined;
                  const categoryColor = cat?.acf?.couleur_associee;
                  const variant = getCategoryVariant(categoryName);
                  const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                  return (
                    <Link
                      key={event.id}
                      href={`/evenement/${event.slug}`}
                      className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-yellow-50 flex flex-col h-full"
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          {categoryName && (
                            <span
                              className={cn(
                                "w-full inline-flex items-center px-4 py-2 text-sm font-medium",
                                !categoryColor && (variantColors[variant]?.badge || variantColors["chart-1"].badge)
                              )}
                              style={categoryColor ? { background: categoryColor, color: '#fff' } : {}}
                            > 
                              {categoryName}
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-1">
                        <h3
                          className={cn(
                            "text-xl font-semibold mb-3 transition-colors group-hover:text-primary",
                            categoryColor && "group-hover:text-[var(--cat-color)]"
                          )}
                          style={categoryColor ? { color: "#000", "--cat-color": categoryColor } as React.CSSProperties : { color: "#000" }}
                        >
                          {decodeHtmlEntities(event.title.rendered)}
                        </h3>
                        {event.acf?.date_de_debut && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {(() => {
                                const [day, month, year] = event.acf.date_de_debut.split("/").map(Number);
                                const date = new Date(year, month - 1, day);
                                return date.toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                });
                              })()}
                              {event.acf.date_de_fin && (() => {
                                const [day, month, year] = event.acf.date_de_fin.split("/").map(Number);
                                const date = new Date(year, month - 1, day);
                                return ' - ' + date.toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                });
                              })()}
                            </span>
                          </div>
                        )}
                        {event.acf?.heure_de_debut && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ClockIcon className="w-4 h-4" />
                            <span>{event.acf.heure_de_debut}{event.acf.heure_de_fin && ` - ${event.acf.heure_de_fin}`}</span>
                          </div>
                        )}
                        {event.acf?.["sous-titre"] && (
                          <div className="text-base text-muted-foreground mt-2">
                            {decodeHtmlEntities(event.acf["sous-titre"])}
                          </div>
                        )}
                        </div>
                      </div>
                      <div className="relative aspect-square overflow-hidden">
                        {featuredImage ? (
                          <img
                            src={featuredImage || "/placeholder.svg"}
                            alt={event.title.rendered}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <CalendarIcon className="w-16 h-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-white text-primary border border-primary/30 shadow-sm">
                          À venir
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
          {/* Grille des événements passés (optionnel, à afficher si besoin) */}
          {/* {pastEvents.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Événements passés</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  ...
                ))}
              </div>
            </section>
          )} */}
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto mb-12">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}
        </div>
      </div>
    )
  }

  const page = isPreview
    ? await getWordPressPageBySlug(slug, { status: "any" })
    : await getWordPressPageBySlug(slug)
  if (!page) {
    notFound()
    return
  }
  const allPages = await getWordPressPages();
  const childPages = await getChildPages(page.id)
  const events = await getEventsByPageSlug(slug)

  if (slug === "actualites") {
    encadres = page.acf?.encadres;
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
    const fixedImages = Array.isArray(page.acf?.images)
      ? page.acf.images.map(img => ({ ...img, height: 0, width: 0 }))
      : undefined;
    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
        />
        <PageContent content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
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
    encadres = page.acf?.encadres;
    const teamMembers = await getTeamMembers()
    const fixedImages = Array.isArray(page.acf?.images)
      ? page.acf.images.map(img => ({
          ...img,
          height: 0,
          width: 0,
        }))
      : undefined;
    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
        />
        <PageContent content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
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
    encadres = page.acf?.encadres;
    const partners = await getPartners()
    const fixedImages = Array.isArray(page.acf?.images)
      ? page.acf.images.map(img => ({
          ...img,
          height: 0,
          width: 0,
        }))
      : undefined;
    return (
      <div className="min-h-screen bg-background pt-20">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
        />
        <PageContent content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
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

  // Correction typage events (duree_en_heures)
  const fixedEvents = events.map(e => ({
    ...e,
    acf: {
      ...e.acf,
      duree_en_heures: e.acf?.duree_en_heures !== undefined ? String(e.acf.duree_en_heures) : undefined,
    },
  }));
  const fixedImages = Array.isArray(page.acf?.images)
    ? page.acf.images.map(img => ({
        ...img,
        height: 0,
        width: 0,
      }))
    : undefined;
  encadres = page.acf?.encadres;
  return (
    <div className="min-h-screen bg-background pt-20">
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.["sous-titre"]}
        backgroundImage={page.acf?.background?.url}
        backgroundAlt={page.acf?.background?.alt}
        slug={slug}
      />
      <PageContent content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
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
                  href={getPagePath(childPage, allPages)}
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
        {fixedEvents.length > 0 && (
          <section className="mt-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Événements associés</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fixedEvents.map((event) => {
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
                        <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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
                                {event.acf.heure} ({event.acf.duree_en_heures?.toString()}h)
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


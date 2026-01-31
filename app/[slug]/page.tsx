import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import {
  getWordPressPageBySlug,
  getAllPageSlugs,
  getEventsByPageSlug,
  getWordPressPages,
  getTeamMembers,
  getPartners,
} from "@/lib/wordpress-api"
import Link from "next/link"
import PageHeader from "@/components/page-header"
import { TeamMembers } from "@/components/team-members"
import { PartnersList } from "@/components/partners-list"
import { PageContent } from "@/components/page-content"
import { cn } from "@/lib/utils"
import { getCategoryVariant } from "@/lib/category-colors"
import { variantColors } from "@/components/ui/site-card"

const variantBorderColors: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  "chart-1": "border-chart-1",
  "chart-2": "border-chart-2",
  "chart-3": "border-chart-3",
  "chart-4": "border-chart-4",
  "chart-5": "border-chart-5",
  info: "border-blue-500",
  partner: "border-green-500",
};


export async function generateStaticParams() {
  const RESERVED_ROUTES = ["actualites", "evenement", "api", "not-found", "_next", "favicon.ico", "agenda"]
  const slugs = await getAllPageSlugs()
  const filteredSlugs = slugs.filter((slug) => !RESERVED_ROUTES.includes(slug))
  return filteredSlugs.map((slug) => ({ slug }))
}

export const dynamicParams = false
export const revalidate = 3600 // Added ISR with 1 hour revalidation


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



async function getChildPages(parentId: number) {
  const allPages = await getWordPressPages()
  return allPages.filter((page) => page.parent === parentId).sort((a, b) => a.menu_order - b.menu_order)
}



export default async function WordPressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("__prv")?.value === "1"

  let encadres: any = undefined;

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
  
  // Trouver la page parente si elle existe
  const parentPage = page.parent && page.parent !== 0
    ? allPages.find(p => p.id === page.parent)
    : undefined;

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
    // Récupération de la vidéo (tableau, un seul élément)
    const teamVideoArray = page.acf?.video_de_lequipe;
    console.warn("TeamVideoArray dans page.tsx :", teamVideoArray.url);
    const teamVideoUrl = teamVideoArray.url;
    return (
      <div className="min-h-screen">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
          childPages={childPages}
          allPages={allPages}
          parentPage={parentPage}
        />
        <PageContent
          slug={slug}
          content={page.acf?.contenu}
          images={fixedImages}
          encadres={encadres}
          teamVideoUrl={teamVideoUrl} // Ajout ici
        />
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
      <div className="min-h-screen">
        <PageHeader
          title={page.title.rendered}
          subtitle={page.acf?.["sous-titre"]}
          backgroundImage={page.acf?.background?.url}
          backgroundAlt={page.acf?.background?.alt}
          slug={slug}
          childPages={childPages}
          allPages={allPages}
          parentPage={parentPage}
        />
        <PageContent slug={slug} content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
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

  const fixedImages = Array.isArray(page.acf?.images)
    ? page.acf.images.map(img => ({
        ...img,
        height: 0,
        width: 0,
      }))
    : undefined;
  encadres = page.acf?.encadres;
  return (
    <div className="min-h-screen">
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.["sous-titre"]}
        backgroundImage={page.acf?.background?.url}
        backgroundAlt={page.acf?.background?.alt}
        slug={slug}
        childPages={childPages}
        allPages={allPages}
        parentPage={parentPage}
      />
      <PageContent slug={slug} content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
      <div className="container mx-auto px-4 py-12">
        <article className="prose prose-lg max-w-4xl mx-auto">
          <div
            className="text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content?.rendered || "" }}
          />
        </article>
        {events.length > 0 && (
          <section className="mt-16 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Événements à venir</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events
                .sort((a, b) => {
                  if (!a.acf?.date_de_debut || !b.acf?.date_de_debut) return 0;
                  const [dayA, monthA, yearA] = a.acf.date_de_debut.split("/").map(Number);
                  const [dayB, monthB, yearB] = b.acf.date_de_debut.split("/").map(Number);
                  const dateA = new Date(yearA, monthA - 1, dayA).getTime();
                  const dateB = new Date(yearB, monthB - 1, dayB).getTime();
                  return dateA - dateB;
                })
                .slice(0, 3)
                .map((event) => {
                type CategoryTerm = {
                  id: number;
                  name: string;
                  slug: string;
                  taxonomy: string;
                  acf?: {
                    couleur_associee?: string;
                  };
                };
                const cat = event._embedded?.["wp:term"]?.flat().find(
                  (term: CategoryTerm) => term.taxonomy === "category"
                ) as CategoryTerm | undefined;
                const categoryName = cat ? decodeHtmlEntities(cat.name) : undefined;
                const categoryColor = cat?.acf?.couleur_associee;
                const variant = getCategoryVariant(categoryName);
                const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                
                // Get event tags
                const eventTags = event._embedded?.["wp:term"]?.flat()
                  .filter((term: any) => term.taxonomy === "post_tag")
                  .map((term: any) => decodeHtmlEntities(term.name)) || [];

                return (
                  <section
                    key={event.id}
                    href={`/evenement/${event.slug}`}
                    className="group bg-card overflow-hidden transition-all duration-300 border-2 border-black flex flex-col h-full"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                        {categoryName && (
                          <span
                            className={cn(
                              "w-full inline-flex items-center px-4 py-2 font-medium border-2",
                              !categoryColor && (variantColors[variant]?.badge || variantColors["chart-1"].badge),
                              !categoryColor && (variantBorderColors[variant] || "border-border")
                            )}
                            style={categoryColor ? { background: categoryColor, color: "#000", borderColor: categoryColor } : undefined}
                          >
                            {categoryName}
                          </span>
                        )}
                      </div>
                      
                      {eventTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {eventTags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs font-medium bg-black backdrop-blur-sm text-white"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="p-4 flex-1">
                        <h3
                          className={cn(
                            "text-xl font-semibold mb-3 transition-colors group-hover:text-primary",
                            categoryColor && "group-hover:text-(--cat-color)"
                          )}
                          style={categoryColor ? { color: "#000", ["--cat-color"]: categoryColor } as React.CSSProperties : { color: "#000" }}
                        >
                          {decodeHtmlEntities(event.title.rendered)}
                        </h3>
                        {event.acf?.date_de_debut && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <svg className="w-4 h-4" style={categoryColor ? { color: categoryColor } : {}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
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
                            <svg className="w-4 h-4" style={categoryColor ? { color: categoryColor } : {}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
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
                        <>
                          <img
                            src={featuredImage || "/placeholder.svg"}
                            alt={event.title.rendered}
                            className="w-full h-full object-cover group-hover:blur-sm transition-all duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          {event.acf?.descriptif && (
                            <div className="absolute inset-x-0 bottom-0 bg-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                                {decodeHtmlEntities(event.acf.descriptif.replace(/<[^>]*>/g, ""))}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <svg className="w-16 h-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


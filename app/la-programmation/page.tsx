import { sanitizeHtml } from "@/lib/sanitize"
import { notFound } from "next/navigation"
import AgendaFiltersClient from "@/components/agenda-filters-client"
import PageHeader from "@/components/page-header"
import { PageContent } from "@/components/page-content"
import { getWordPressEvents, getWordPressPageBySlug } from "@/lib/wordpress-api"
import { Metadata } from "next"
import { generateMetadataFromYoast } from "@/lib/seo"
import { MetadataPreview } from "@/components/preview"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWordPressPageBySlug("la-programmation")
  if (!page) {
    return {}
  }
  return generateMetadataFromYoast(page.yoast_head_json, page.title.rendered)
}

function decodeHtmlEntities(text: string) {
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
    .trim()
}

export default async function AgendaPage() {
  const [page, allEvents] = await Promise.all([
    getWordPressPageBySlug("la-programmation"),
    getWordPressEvents(),
  ])
  if (!page) notFound()

  const fixedEvents = allEvents.map(e => ({
    ...e,
    acf: {
      ...e.acf,
      duree_en_heures:
        e.acf?.duree_en_heures !== undefined
          ? String(e.acf.duree_en_heures)
          : undefined,
    },
  }))

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const parseDate = (dateStr: string | undefined) => {
    if (!dateStr) return null
    const [day, month, year] = dateStr.split("/").map(Number)
    return new Date(year, month - 1, day)
  }

  const upcomingEvents = fixedEvents
    .filter(event => {
      const startDate = parseDate(event.acf?.date_de_debut)
      return startDate && startDate >= now
    })
    .sort((a, b) => {
      const da = parseDate(a.acf?.date_de_debut)
      const db = parseDate(b.acf?.date_de_debut)
      return (da?.getTime() || 0) - (db?.getTime() || 0)
    })

  const allCategories = Array.from(
    new Set(
      upcomingEvents.flatMap(e =>
        e._embedded?.["wp:term"]?.
          flat()
          .filter((term: any) => term.taxonomy === "category")
          .map((term: any) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  )

  const allTags = Array.from(
    new Set(
      upcomingEvents.flatMap(e =>
        e._embedded?.["wp:term"]?.
          flat()
          .filter((term: any) => term.taxonomy === "post_tag")
          .map((term: any) => decodeHtmlEntities(term.name)) || [],
      ),
    ),
  )

  const fixedImages = Array.isArray(page.acf?.images)
    ? page.acf.images.map(img => ({ ...img, height: 0, width: 0 }))
    : undefined
  const encadres = page.acf?.encadres

  return (
    <div className="min-h-screen">
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.["sous-titre"]}
        backgroundImage={page.acf?.background?.url}
        backgroundAlt={page.acf?.background?.alt}
        slug="la-programmation"
      />
      <PageContent slug="la-programmation" content={page.acf?.contenu} images={fixedImages} encadres={encadres} />
      <div className="container mx-auto px-4 py-12">
        <AgendaFiltersClient categories={allCategories} tags={allTags} events={upcomingEvents} />
        {page.content?.rendered && (
          <article className="prose prose-lg max-w-4xl mx-auto mb-12">
            <div
              className="text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content.rendered) }}
            />
          </article>
        )}
        <MetadataPreview metadata={page.yoast_head_json} />
      </div>
    </div>
  )
}

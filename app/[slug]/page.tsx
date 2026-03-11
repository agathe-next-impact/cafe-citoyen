import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import {
  getWordPressPageBySlug,
  getAllPageSlugs,
  getEventsByPageSlug,
  getWordPressPages,
  getTeamMembers,
  getPartners,
  getSiteOptions,
} from "@/lib/wordpress-api"
import PageHeader from "@/components/page-header"
import { TeamMembers } from "@/components/team-members"
import { PartnersList } from "@/components/partners-list"
import { PageContent } from "@/components/page-content"
import EventCard from "@/components/event-card"
import { cn, stripHtml, truncate } from "@/lib/utils"
import { getCategoryVariant } from "@/lib/category-colors"
import { variantColors } from "@/components/ui/site-card"
import { Metadata } from "next"
import { generateMetadataFromYoast } from "@/lib/seo"
import { FileText } from "lucide-react"
import { WordPressContent } from "@/components/wordpress-content"

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [page, siteOptions] = await Promise.all([
    getWordPressPageBySlug(slug),
    getSiteOptions(),
  ])
  if (!page) {
    return {}
  }
  return generateMetadataFromYoast(page.yoast_head_json, {
    title: page.title.rendered,
    description: page.acf?.["sous-titre"] || truncate(stripHtml(page.content?.rendered || ""), 160),
    image: siteOptions?.logo_du_site?.url,
  })
}


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

  if (slug === "equipe-nous-contacter") {
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
              <WordPressContent
                content={page.content.rendered}
                className="text-foreground/80 leading-relaxed"
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
              <WordPressContent
                content={page.content.rendered}
                className="text-foreground/80 leading-relaxed"
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
          <WordPressContent
            content={page.content?.rendered || ""}
            className="text-foreground/80 leading-relaxed"
          />
        </article>

        {slug === "administration" && page.acf?.docs_a_presenter && page.acf.docs_a_presenter.length > 0 && (
          <section className="max-w-4xl mx-auto mt-12 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Documents officiels</h2>
            <div className="grid gap-4">
              {page.acf.docs_a_presenter.map((item, idx) => {
                const doc = item.document;
                if (!doc?.fichier) return null;

                let pdfUrl = doc.fichier.url;
                try {
                  const urlObj = new URL(pdfUrl);
                  if (urlObj.pathname.startsWith('/wp-content')) {
                    pdfUrl = urlObj.pathname + urlObj.search;
                  }
                } catch (e) {
                  // Keep original URL
                }

                return (
                  <a
                    key={idx}
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-black hover:bg-black/5 transition-colors"
                  >
                    <div className="p-3 bg-black rounded-full text-white group-hover:bg-primary group-hover:text-black/5 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {doc.titre_du_document || doc.fichier.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Document PDF
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section className="md:mt-16 max-w-7xl mx-auto">
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
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    decodeHtmlEntities={decodeHtmlEntities}
                    getCategoryVariant={getCategoryVariant}
                    variantColors={variantColors}
                    variantBorderColors={variantBorderColors}
                  />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


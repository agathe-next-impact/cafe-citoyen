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
  getWordPressPages,
  getTeamMembers,
  getWordPressPosts, // Added posts import
  getPartners, // Added getPartners import
} from "@/lib/wordpress-api"
import Link from "next/link"
import PageHeader from "@/components/page-header"
import { TeamMembers } from "@/components/team-members" // Added team members component
import { PostsList } from "@/components/posts-list" // Added posts list component
import { PartnersList } from "@/components/partners-list"
import { PageContent } from "@/components/page-content" // Added PageContent component import



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
      </div>
    </div>
  )
}


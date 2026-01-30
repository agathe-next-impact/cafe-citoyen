import Link from "next/link";
import {
  getWordPressPosts,
  getWordPressPageBySlug,
  getWordPressPages,
} from "@/lib/wordpress-api";
import { decodeHtmlEntities } from "@/components/wp-decode";
import { formatDate } from "@/lib/utils";
import PageHeader from "@/components/page-header";
import { PageContent } from "@/components/page-content";
import { notFound } from "next/navigation";

export const revalidate = 60;

async function getChildPages(pageId: number) {
  const allPages = await getWordPressPages();
  return allPages
    .filter((p) => p.parent === pageId)
    .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
}

export default async function ActualitesArchivePage() {
  const [posts, page] = await Promise.all([
    getWordPressPosts(),
    getWordPressPageBySlug("actualites"),
  ]);

  if (!page) {
    return notFound();
  }

  const allPages = await getWordPressPages();
  const childPages = await getChildPages(page.id);

  const fixedImages = Array.isArray(page.acf?.images)
    ? page.acf.images.map((img: any) => ({
        ...img,
        height: 0,
        width: 0,
      }))
    : undefined;

  return (
    <div className="min-h-screen bg-amber-50/10">
      <PageHeader
        title={page.title.rendered}
        subtitle={page.acf?.["sous-titre"]}
        backgroundImage={page.acf?.background?.url}
        backgroundAlt={page.acf?.background?.alt}
        slug="actualites"
        childPages={childPages}
        allPages={allPages}
      />

      <PageContent
        slug="actualites"
        content={page.acf?.contenu}
        images={fixedImages}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => {
            const author =
              post._embedded?.author?.[0]?.name || "Auteur inconnu";
            const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
            const categories =
              post._embedded?.["wp:term"]
                ?.flat()
                .filter((term: any) => term.taxonomy === "category")
                .map((term: any) => term.name) || [];

            return (
              <Link
                key={post.id}
                href={`/actualites/${post.slug}`}
                className="group overflow-hidden bg-white transition-all duration-300 border-2 border-black"
              >
                {/* Image */}
                {featuredImage?.source_url && (
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={featuredImage.source_url}
                      alt={featuredImage.alt_text || post.title.rendered}
                      className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300"
                    />
                  </div>
                )}

                {/* Contenu */}
                <div>
                  {/* Catégories */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 2).map((cat: string) => (
                        <span
                          key={cat}
                          className="text-xs font-medium px-2.5 py-1 bg-black text-white"
                        >
                          {decodeHtmlEntities(cat)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Titre */}
                  <h3 className="text-xl font-bold mb-2 transition-colors line-clamp-2 px-4 pt-4">
                    {decodeHtmlEntities(post.title.rendered)}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 px-4">
                    {post.excerpt?.rendered
                      ? decodeHtmlEntities(
                          post.excerpt.rendered.replace(/<[^>]*>/g, ""),
                        )
                      : ""}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-xs text-gray-700 px-4 pb-4">
                    <time>{formatDate(post.date)}</time>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

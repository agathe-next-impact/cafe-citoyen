import Link from "next/link";
import ArticleCard from "@/components/article-card";
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
import { Metadata } from "next";
import { generateMetadataFromYoast } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getWordPressPageBySlug("actualites");
  if (!page) {
    return {};
  }
  return generateMetadataFromYoast(page.yoast_head_json, {
    title: page.title.rendered,
    description: page.acf?.["sous-titre"],
    image: page.acf?.background?.url,
  });
}

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
          {posts.map((post: any) => (
            <ArticleCard key={post.id} post={post} />
          ))}
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

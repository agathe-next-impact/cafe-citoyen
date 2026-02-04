import { decodeHtmlEntities } from "@/components/wp-decode"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { generateMetadataFromYoast } from "@/lib/seo"

import { getPost, getPosts } from "./data"
import { WordPressPost } from "@/lib/wordpress-api"
import PageHeader from "@/components/page-header"

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug) as WordPressPost
  
  if (!post) {
     return {}
  }

  return generateMetadataFromYoast(post.yoast_head_json, {
     title: post.title.rendered,
     description: post.excerpt?.rendered?.replace(/<[^>]*>?/gm, ''),
     image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
  })
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export const dynamicParams = true // Allow dynamic slugs not in generateStaticParams

type Embedded = {
  author?: { name: string }[] | undefined;
  "wp:featuredmedia"?: { source_url: string; alt_text: string; }[] | undefined;
  "wp:term"?: { id: number; name: string; slug: string; taxonomy: string; }[][] | undefined;
};

type Post = {
  title: { rendered: string };
  date: string;
  content?: { rendered: string };
  _embedded?: Embedded;
  // add other fields as needed
};

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post: Post | null = await getPost(slug)
  if (!post) return notFound()

  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]
  const author = post._embedded?.author?.[0]?.name || "Auteur inconnu"
  const categories =
    post._embedded?.["wp:term"]
      ?.flat()
      .filter((term: any) => term.taxonomy === "category")
      .map((term: any) => ({ name: term.name, slug: term.slug })) || []

  return (
    <div className="min-h-screen bg-amber-50/10">
      <PageHeader
        title={post.title.rendered}
        subtitle={null}
        backgroundImage={featuredImage?.source_url || null}
        backgroundAlt={featuredImage?.alt_text || post.title.rendered}
        slug="actualites"
        childPages={[]}
        allPages={[]}
      />

      <article className="md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6">

        <div className="flex items-center gap-4 text-muted-foreground border-b">
        {/* Catégories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/actualites?categorie=${cat.slug}`}
                className="text-sm font-medium px-3 py-1.5 bg-black text-white hover:bg-black/80 transition-colors"
              >
                {decodeHtmlEntities(cat.name)}
              </Link>
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <time>{formatDate(post.date)}</time>
        </div>

        </div>

        {/* Contenu */}
        <div
          className="prose prose-lg max-w-none pt-10"
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.content?.rendered || "") }}
        />
      </article>
    </div>
  )
}
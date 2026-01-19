import { decodeHtmlEntities } from "@/components/wp-decode"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"

import { getPost, getPosts } from "./data"

export const revalidate = 60

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
      .map((term: any) => term.name) || []

  return (
    <div className="min-h-screen bg-amber-50/10">
      <article className="md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6">
        {/* Image à la une */}
        {featuredImage?.source_url && (
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={featuredImage.source_url}
              alt={featuredImage.alt_text || post.title.rendered}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Catégories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat: string) => (
              <span
                key={cat}
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-purple-100 text-purple-700"
              >
                {decodeHtmlEntities(cat)}
              </span>
            ))}
          </div>
        )}

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {decodeHtmlEntities(post.title.rendered)}
        </h1>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
          <span>{decodeHtmlEntities(author)}</span>
          <span>•</span>
          <time>{formatDate(post.date)}</time>
        </div>

        {/* Contenu */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.content?.rendered || "") }}
        />
      </article>
    </div>
  )
}
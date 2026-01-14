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

export default async function SinglePostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) return notFound()

  return (
    <main>
      <article>
        <h1 className="text-4xl font-bold mb-4">
          {decodeHtmlEntities(post.title.rendered)}
        </h1>
        <div className="text-muted-foreground mb-6">
          {decodeHtmlEntities(post._embedded?.author?.[0]?.name || "")} — {formatDate(post.date)}
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(post.content.rendered) }}
        />
      </article>
    </main>
  )
}
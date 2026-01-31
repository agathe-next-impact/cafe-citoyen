import Link from "next/link";
import { decodeHtmlEntities } from "@/components/wp-decode";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  post: any;
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const author = post._embedded?.author?.[0]?.name || "Auteur inconnu";
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
                post.excerpt.rendered.replace(/<[^>]*>/g, "")
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
}

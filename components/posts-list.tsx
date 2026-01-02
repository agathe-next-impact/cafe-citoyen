"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { WordPressPost } from "@/lib/wordpress-api"

const SearchIcon = ({ className }: { className?: string }) => (
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
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

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

interface PostsListProps {
  posts: WordPressPost[]
  categories: string[]
}

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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function PostsList({ posts, categories }: PostsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch =
          searchQuery === "" ||
          decodeHtmlEntities(post.title.rendered).toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.rendered.toLowerCase().includes(searchQuery.toLowerCase())

        const postCategories =
          post._embedded?.["wp:term"]
            ?.flat()
            .filter((term) => term.taxonomy === "category")
            .map((term) => decodeHtmlEntities(term.name)) || []

        const matchesCategory = selectedCategory === "" || postCategories.includes(selectedCategory)

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [posts, searchQuery, selectedCategory])

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Toutes
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""} trouvé
          {filteredPosts.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => {
          const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
          const postCategories =
            post._embedded?.["wp:term"]
              ?.flat()
              .filter((term) => term.taxonomy === "category")
              .map((term) => decodeHtmlEntities(term.name)) || []

          return (
            <Link
              key={post.id}
              href={`/actualite/${post.slug}`}
              className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                {featuredImage ? (
                  <img
                    src={featuredImage || "/placeholder.svg"}
                    alt={decodeHtmlEntities(post.title.rendered)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <CalendarIcon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(post.date)}</span>
                </div>

                {postCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {postCategories.slice(0, 2).map((category) => (
                      <span key={category} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {decodeHtmlEntities(post.title.rendered)}
                </h3>

                <div
                  className="text-sm text-muted-foreground line-clamp-3 mb-4"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />

                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                  Lire la suite
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">Aucun article trouvé.</p>
        </div>
      )}
    </div>
  )
}

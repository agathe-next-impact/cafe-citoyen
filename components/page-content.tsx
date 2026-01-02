interface PageContentProps {
  content?: string
  images?: Array<{
    url: string
    alt: string
    title: string
    ID: number
  }>
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

export function PageContent({ content, images }: PageContentProps) {
  if (!content && (!images || images.length === 0)) {
    return null
  }

  return (
    <section className="py-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* WYSIWYG Content */}
        {content && (
          <article className="prose prose-lg max-w-none mb-8">
            <div className="text-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}

        {/* Images Gallery */}
        {images && images.length > 0 && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.ID}
                  className="group relative aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt || image.title || "Image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {image.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium">{decodeHtmlEntities(image.title)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

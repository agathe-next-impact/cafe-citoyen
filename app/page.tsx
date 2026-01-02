import { getWordPressPageBySlug } from "@/lib/wordpress-api"
import { PageHeader } from "@/components/page-header"
import { PageContent } from "@/components/page-content"
import BounceCards from "@/components/bounce-cards"
import { notFound } from "next/navigation"

export default async function Home() {
  const page = await getWordPressPageBySlug("accueil")

  if (!page) {
    notFound()
    return null
  }

  const hasHeroGallery = page.acf?.galerie && page.acf.galerie.length > 0

  return (
    <div className="min-h-screen bg-background">
      {hasHeroGallery ? (
        <section className="relative h-screen flex items-center justify-center bg-white overflow-hidden">
          <div className="container mx-auto h-full flex items-center justify-center max-w-full">
            <BounceCards
              className="hero-bounce-cards"
              images={page.acf.galerie.map((img) => img.url)}
              containerWidth={typeof window !== "undefined" ? window.innerWidth * 0.95 : 1400}
              containerHeight={typeof window !== "undefined" ? window.innerHeight * 0.95 : 900}
              animationDelay={0.5}
              animationStagger={0.08}
              enableHover={true}
            />
          </div>
        </section>
      ) : (
        <div className="pt-20">
          <PageHeader
            title={page.title.rendered}
            subtitle={page.acf?.["sous-titre"]}
            backgroundImage={page.acf?.background?.url}
            backgroundAlt={page.acf?.background?.alt}
          />
        </div>
      )}

      <div className="relative bg-white">
        <PageContent content={page.acf?.contenu} images={page.acf?.images} />

        <div className="container mx-auto px-4 py-12">
          {page.content?.rendered && (
            <article className="prose prose-lg max-w-4xl mx-auto">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}
        </div>
      </div>
    </div>
  )
}

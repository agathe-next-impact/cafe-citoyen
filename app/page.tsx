import { getWordPressPageBySlug, getSiteOptions } from "@/lib/wordpress-api"
import PageHeader from "@/components/page-header"
import { PageContent } from "@/components/page-content"
import { notFound } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"

const BounceCards = dynamic(() => import("@/components/bounce-cards"))
const VideoHero = dynamic(() => import("@/components/video-hero").then((mod) => mod.VideoHero))

type VideoType = string; // oEmbed HTML

type HeroMenuLink = {
  lien: {
    texte_du_lien: string;
    page: Array<{
      ID: number;
      post_title: string;
      post_name: string;
    }>;
  };
};

type AcfType = {
  video?: VideoType | null;
  galerie?: { url: string }[];
  background?: { url?: string; alt?: string };
  ["sous-titre"]?: string;
  contenu?: any;
  images?: any;
  liens_du_menu_du_hero?: HeroMenuLink[];
};

export default async function Home() {
  const page = await getWordPressPageBySlug("accueil")
  if (!page) {
    notFound()
    return null
  }

  const acf = page.acf as AcfType | undefined;

  const hasVideoHero = acf?.video && typeof acf.video === 'string' && acf.video.trim().length > 0
  const hasHeroGallery = acf?.galerie && acf.galerie.length > 0

  let siteOptions = null
  let siteHeaderImage = null
  if (!hasVideoHero && !hasHeroGallery) {
    siteOptions = await getSiteOptions()
    siteHeaderImage = siteOptions?.logo_du_site?.url || null
  }

  return (
    <div className="min-h-screen -mt-20">
      {hasVideoHero ? (
        <VideoHero embedHtml={acf?.video || ""} menuLinks={acf?.liens_du_menu_du_hero} />
      ) : hasHeroGallery ? (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="container mx-auto h-full flex items-center justify-center max-w-full">
            <BounceCards
              className="hero-bounce-cards"
              images={acf?.galerie?.map((img) => img.url) || []}
              containerWidth={typeof window !== "undefined" ? window.innerWidth * 0.95 : 1400}
              containerHeight={typeof window !== "undefined" ? window.innerHeight * 0.95 : 900}
              animationDelay={0.5}
              animationStagger={0.08}
              enableHover={true}
            />
          </div>
        </section>
      ) : acf?.background?.url ? (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden -mt-20">
          <Image
            src={acf.background.url}
            alt={acf.background.alt || page.title.rendered}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ zIndex: 0 }}
          />
        </section>
      ) : siteHeaderImage ? (
        <div className="pt-20">
          <PageHeader
            title={page.title.rendered}
            subtitle={acf?.["sous-titre"]}
            backgroundImage={siteHeaderImage}
            backgroundAlt={siteOptions?.logo_du_site?.alt || ""}
          />
        </div>
      ) : (
        <div className="pt-20">
          <PageHeader
            title={page.title.rendered}
            subtitle={acf?.["sous-titre"]}
            backgroundImage={acf?.background?.url}
            backgroundAlt={acf?.background?.alt}
          />
        </div>
      )}

      <div className="relative">
        <PageContent slug="home" content={acf?.contenu} images={acf?.images} />

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

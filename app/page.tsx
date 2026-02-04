import { getWordPressPageBySlug, getSiteOptions, getWordPressEvents, getWordPressPosts } from "@/lib/wordpress-api"
import { generateMetadataFromYoast } from "@/lib/seo"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const [page, siteOptions] = await Promise.all([
    getWordPressPageBySlug("accueil"),
    getSiteOptions()
  ])
  if (!page) {
    return {}
  }
  return generateMetadataFromYoast(page.yoast_head_json, {
    title: page.title.rendered,
    description: page.acf?.["sous-titre"],
    image: siteOptions?.logo_du_site?.url,
  })
}

import EventCard from "@/components/event-card"
import ArticleCard from "@/components/article-card"
import { decodeHtmlEntities } from "@/components/wp-decode"
import { getCategoryVariant } from "@/lib/category-colors"
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
  image_logo?: { src?: string; alt?: string };
  liens_du_menu_du_hero?: HeroMenuLink[];
  section_video?: {
    video?: string | null;
    lien?: string; // page_link ACF retourne une URL
  };
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


      <div className="container mx-auto px-4 py-12">
        <PageContent slug="home" content={acf?.contenu} images={acf?.images} />

        {/* Prochains événements à venir */}
        {async function UpcomingEvents() {
          const allEvents = await getWordPressEvents();
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const parseDate = (dateStr: string | undefined) => {
            if (!dateStr) return null;
            const [day, month, year] = dateStr.split("/").map(Number);
            return new Date(year, month - 1, day);
          };
          const upcoming = allEvents
            .filter((event: any) => {
              const startDate = parseDate(event.acf?.date_de_debut);
              return startDate && startDate >= now;
            })
            .sort((a: any, b: any) => {
              const dateA = parseDate(a.acf?.date_de_debut)?.getTime() || 0;
              const dateB = parseDate(b.acf?.date_de_debut)?.getTime() || 0;
              return dateA - dateB;
            })
            .slice(0, 6);
          if (!upcoming.length) return null;
          return (
            <section className="max-w-7xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-8">Prochains événements</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((event: any) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    decodeHtmlEntities={decodeHtmlEntities}
                    getCategoryVariant={getCategoryVariant}
                    variantColors={{}}
                    variantBorderColors={{}}
                  />
                ))}
              </div>
              <div className="mt-8 text-center">
                <a
                  href="/agenda"
                  className="inline-block px-6 py-3 bg-black text-white font-medium border-2 border-black hover:bg-white hover:text-black transition-colors"
                >
                  Voir tous les événements
                </a>
              </div>
            </section>
          );
        }()}

          {page.content?.rendered && (
            <article className="prose prose-lg mx-auto">
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </article>
          )}

          {/* Derniers articles d'actualité
          {await (async function LatestArticles() {
            const posts = await getWordPressPosts();
            const latest = posts.slice(0, 3);
            if (!latest.length) return null;
            return (
              <section className="mt-16 mx-auto">
                <h2 className="text-4xl font-bold text-foreground mb-8">Derniers articles d'actualité</h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {latest.map((post: any) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <a
                    href="/actualites"
                    className="inline-block px-6 py-3 bg-black text-white font-medium border-2 border-black hover:bg-white hover:text-black transition-colors"
                  >
                    Voir toutes les actualités
                  </a>
                </div>
              </section>
            );
          })()}*/}
      </div>


      {/* Section vidéo ACF */}    

      {acf?.section_video?.video && acf?.section_video?.lien && await (async () => {
        const fullUrl = acf.section_video.lien || "";
        const slug = fullUrl.split('/').filter(Boolean).pop() || '';
        
        // Récupérer le titre de la page liée
        const linkedPage = await getWordPressPageBySlug(slug);
        const linkText = linkedPage?.title?.rendered || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
        
        return (
          <div>
            <VideoHero
              embedHtml={acf.section_video.video}
              image={acf.logo_image.src || undefined}
              menuLinks={[{
                lien: {
                  texte_du_lien: linkText,
                  page: [{
                    ID: linkedPage?.id || 0,
                    post_title: linkText,
                    post_name: slug,
                  }],
                },
              }]}
            />
          </div>
        );
      })()}

    </div>
  )
}

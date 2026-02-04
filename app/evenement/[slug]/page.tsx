import { getWordPressEventBySlug, getAllEventSlugs, getWordPressEvents } from "@/lib/wordpress-api"
import { Calendar, Clock, ArrowLeft, CalendarDays, Users } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import PageHeader from "@/components/page-header"
import { SiteCard, variantColors } from "@/components/ui/site-card"
import EventCard from "@/components/event-card"
import { getCategoryVariant } from "@/lib/category-colors"
import { decodeHtmlEntities } from "@/components/wp-decode"
import { formatDate } from "@/lib/utils"
import { generateMetadataFromYoast } from "@/lib/seo"

type Props = {
  params: Promise<{ slug: string }>
}

function parseFrenchDate(dateString: string): Date | null {
  if (!dateString) return null
  const parts = dateString.split("/")
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  return new Date(year, month - 1, day)
}


export async function generateStaticParams() {
  const slugs = await getAllEventSlugs()
  console.warn("[build] Slugs d'événements:", slugs)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getWordPressEventBySlug(slug)

  if (!event) {
    return {
      title: "Événement introuvable",
    }
  }

  return generateMetadataFromYoast(event.yoast_head_json, {
    title: decodeHtmlEntities(event.title.rendered),
    description: event.excerpt?.rendered?.replace(/<[^>]*>?/gm, "") || event.acf?.descriptif,
    image: event._embedded?.["wp:featuredmedia"]?.[0]?.source_url || event.acf?.background?.url,
  })
}

export default async function SingleEventPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const event = await getWordPressEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const isPonctuel = event.acf?.recurrent_ou_ponctuel
  const dateDebut = event.acf?.date_de_debut ? parseFrenchDate(event.acf.date_de_debut) : new Date(event.date)
  const dateFin = event.acf?.date_de_fin ? parseFrenchDate(event.acf.date_de_fin) : null

  const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url
  const saisonCulturelle = event._embedded?.["wp:term"]?.flat().filter((term) => term.taxonomy === "saison-culturelle")
  const categories = event._embedded?.["wp:term"]?.flat().filter((term) => term.taxonomy === "category")

  // Ajout : récupération des événements à venir
  const allEvents = await getWordPressEvents();
  const now = new Date();
  const upcomingEvents = allEvents.filter(e => {
    if (!e.acf?.date_de_debut) return false;
    const parts = e.acf.date_de_debut.split("/");
    if (parts.length !== 3) return false;
    const [day, month, year] = parts.map(Number);
    const eventDate = new Date(year, month - 1, day);
    return eventDate >= now;
  }).sort((a, b) => {
    // Tri par date croissante
    const aParts = a.acf?.date_de_debut ? a.acf.date_de_debut.split("/").map(Number) : [0, 0, 0];
    const bParts = b.acf?.date_de_debut ? b.acf.date_de_debut.split("/").map(Number) : [0, 0, 0];
    const aDate = new Date(aParts[2], aParts[1] - 1, aParts[0]);
    const bDate = new Date(bParts[2], bParts[1] - 1, bParts[0]);
    return aDate.getTime() - bDate.getTime();
  });

    // Removed timelineData logic and links to other events

  return (
    <main>
      {/* Back Button */}
      <div className="px-6 pt-12 max-w-7xl mx-auto">
        <Link
          href="/agenda"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'agenda</span>
        </Link>
      </div>

      <PageHeader
        title={event.title.rendered}
        subtitle={event.acf?.["sous-titre"]}
        backgroundImage={event.acf?.background?.url || featuredImage}
        backgroundAlt={event.acf?.background?.alt || event.title.rendered}
      />

      {/* Content */}
      <div className="px-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          {/* Taxonomies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {saisonCulturelle?.map((saison) => (
              <span
                key={saison.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary"
              >
                {decodeHtmlEntities(saison.name)}
              </span>
            ))}
            {categories?.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary"
              >
                {decodeHtmlEntities(cat.name)}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-light mb-6 text-balance">
            {decodeHtmlEntities(event.title.rendered)}
          </h1>

          {event.acf?.["sous-titre"] && (
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              {decodeHtmlEntities(event.acf["sous-titre"])}
            </p>
          )}

          {/* Event Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Date Card */}
            <SiteCard variant="info" colorScheme="primary">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  {isPonctuel ? (
                    <Calendar className="h-6 w-6 text-white" />
                  ) : (
                    <CalendarDays className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{isPonctuel ? "Date de l'événement" : "Événement récurrent"}</h3>
                  {isPonctuel ? (
                    <>
                      {dateDebut && <p className="text-sm text-muted-foreground">{formatDate(dateDebut.toISOString())}</p>}
                      {dateFin && dateDebut?.getTime() !== dateFin.getTime() && (
                        <p className="text-sm text-muted-foreground">au {formatDate(dateFin.toISOString())}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {event.acf?.jour && <p className="text-sm text-muted-foreground">Tous les {event.acf.jour}</p>}
                      {(event.acf?.debut_de_periode || event.acf?.fin_de_periode) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Du {event.acf?.debut_de_periode} au {event.acf?.fin_de_periode}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SiteCard>

            {/* Time Card */}
            <SiteCard variant="info" colorScheme="secondary">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Horaires</h3>
                  {isPonctuel ? (
                    <>
                      {event.acf?.heure_de_debut && (
                        <p className="text-sm text-muted-foreground">
                          De {event.acf.heure_de_debut}
                          {event.acf?.heure_de_fin && ` à ${event.acf.heure_de_fin}`}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {event.acf?.heure && <p className="text-sm text-muted-foreground">À {event.acf.heure}</p>}
                      {event.acf?.duree_en_heures && (
                        <p className="text-sm text-muted-foreground mt-1">Durée: {event.acf.duree_en_heures}h</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SiteCard>
          </div>
        </div>

        {/* Gallery */}
        {event.acf?.images && event.acf.images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-6">Galerie</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.acf.images.map((image, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden aspect-square">
                  <EventCard
                    event={event}
                    decodeHtmlEntities={decodeHtmlEntities}
                    getCategoryVariant={getCategoryVariant}
                    variantColors={variantColors}
                    variantBorderColors={{
                      primary: "border-primary",
                      secondary: "border-secondary",
                      "chart-1": "border-chart-1",
                      "chart-2": "border-chart-2",
                      "chart-3": "border-chart-3",
                      "chart-4": "border-chart-4",
                      "chart-5": "border-chart-5",
                      info: "border-blue-500",
                      partner: "border-green-500",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fils d'événements (upcoming events) */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-6">À venir</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  decodeHtmlEntities={decodeHtmlEntities}
                  getCategoryVariant={getCategoryVariant}
                  variantColors={variantColors}
                  variantBorderColors={{
                    primary: "border-primary",
                    secondary: "border-secondary",
                    "chart-1": "border-chart-1",
                    "chart-2": "border-chart-2",
                    "chart-3": "border-chart-3",
                    "chart-4": "border-chart-4",
                    "chart-5": "border-chart-5",
                    info: "border-blue-500",
                    partner: "border-green-500",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {event.acf?.descriptif && (
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-6">À propos</h2>
            <div
              className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(event.acf.descriptif) }}
            />
          </div>
        )}

        {/* Partners */}
        {event.acf?.partenaires_details && event.acf.partenaires_details.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-accent" />
              Partenaires associés
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {event.acf.partenaires_details.map((partenaire) => (
                <SiteCard key={partenaire.id} variant="partner" colorScheme="accent">
                  <a
                    href={partenaire.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium group-hover:text-accent transition-colors">{partenaire.title}</p>
                      <p className="text-sm text-muted-foreground">Partenaire</p>
                    </div>
                  </a>
                </SiteCard>
              ))}
            </div>
          </div>
        )}


        {/* CTA */}
        <div className="pt-8 border-t border-border">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-light mb-4">Intéressé par cet événement ?</h3>
            <p className="text-muted-foreground mb-6 text-pretty">
              Contactez-nous pour plus d'informations ou pour vous inscrire
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Nous contacter
              </Link>
              <Link
                href="/agenda"
                className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border text-foreground rounded-full hover:bg-muted transition-colors"
              >
                Voir tous les événements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

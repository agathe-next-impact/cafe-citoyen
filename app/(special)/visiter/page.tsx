import { getWordPressPageBySlug } from "@/lib/wordpress-api"
import { wpApi } from "@/lib/api"
import PageHeader from "@/components/page-header"
import { GuidedTourClient } from "./guided-tour-client"
import { PageContent } from "@/components/page-content"

export default async function VisiteVirtuellePage() {

  let mapPinPoints: any[] = []
  let page = null

  try {
    // Use the working wordpress-api implementation that explicitly requests ACF fields
    page = await getWordPressPageBySlug("visite-virtuelle")
    if (!page) {
      page = await getWordPressPageBySlug("visiter")
    }
    // getMapPinPoints still uses the api.ts implementation for pin point parsing
    mapPinPoints = await wpApi.getMapPinPoints(page as any)
  } catch (error) {
    console.error(error)
  }

  return (
    <div>
      <PageHeader
        title={page?.title?.rendered || "Visite virtuelle"}
        subtitle="Découvrez notre établissement à travers une visite virtuelle interactive."
      />
      
      {page?.acf && (
        <PageContent 
          content={page.acf.contenu}
          images={page.acf.images as any}
          encadres={page.acf.encadres}
          slug={page.slug}
        />
      )}

      <div className="container mx-auto px-4 py-12">
        <GuidedTourClient mapPinPoints={mapPinPoints} />
      </div>
    </div>
  )
}

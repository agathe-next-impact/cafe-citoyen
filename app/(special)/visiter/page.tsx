import { wpApi } from "@/lib/api"
import PageHeader from "@/components/page-header"
import { GuidedTourClient } from "./guided-tour-client"
import { PageContent } from "@/components/page-content"

export default async function VisiteVirtuellePage() {

  let mapPinPoints = []
  let page = null

  try {
    page = await wpApi.getVisitePage()
    mapPinPoints = await wpApi.getMapPinPoints(page)
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
          images={page.acf.images}
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

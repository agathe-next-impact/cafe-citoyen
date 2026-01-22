import { wpApi } from "@/lib/api"
import PageHeader from "@/components/page-header"
import { GuidedTourClient } from "./guided-tour-client"

export default async function VisiteVirtuellePage() {

  let mapPinPoints = []

  try {
    mapPinPoints = await wpApi.getMapPinPoints()
  } catch (error) {
  }

  return (
    <div>
      <PageHeader
        title="Visite virtuelle"
        subtitle="Découvrez notre établissement à travers une visite virtuelle interactive."
      />
      <div className="container mx-auto px-4 py-12">
        <GuidedTourClient mapPinPoints={mapPinPoints} />
      </div>
    </div>
  )
}

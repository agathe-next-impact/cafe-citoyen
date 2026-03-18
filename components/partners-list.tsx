"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import type { Partner } from "@/lib/wordpress-api"
import { sanitizeHtml } from "@/lib/sanitize"
import { decodeHtmlEntities } from "@/components/wp-decode"

interface PartnersListProps {
  partners: Partner[]
}

export function PartnersList({ partners }: PartnersListProps) {
  // Group partners by type
  const partnersByType = useMemo(() => {
    const grouped = new Map<string, Partner[]>()

    partners.forEach((partner) => {
      const types =
        partner._embedded?.["wp:term"]
          ?.flat()
          .filter((term) => term.taxonomy === "type-de-partenaire")
          .map((term) => decodeHtmlEntities(term.name)) || []

      if (types.length === 0) {
        // Add to "Sans catégorie" if no type
        const uncategorized = grouped.get("Sans catégorie") || []
        uncategorized.push(partner)
        grouped.set("Sans catégorie", uncategorized)
      } else {
        types.forEach((type) => {
          const typePartners = grouped.get(type) || []
          typePartners.push(partner)
          grouped.set(type, typePartners)
        })
      }
    })

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [partners])

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-12">
      {/* Partners grouped by type */}
      {partnersByType.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Aucun partenaire trouvé.</p>
        </div>
      ) : (
        partnersByType.map(([type, typePartners]) => (
          <section key={type} className="space-y-6">
            <h3 className="text-3xl font-bold text-black border-b-2 border-black/20 pb-2">{type}</h3>
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
              {typePartners.map((partner) => {
                const featuredImage =
                  partner._embedded?.["wp:featuredmedia"]?.[0]?.source_url || partner.acf?.images?.[0]?.url
                const title = decodeHtmlEntities(partner.title.rendered)

                return (
                  <div
                    key={partner.id}
                    className="group bg-card overflow-hidden transition-all duration-300 border border-border"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {featuredImage ? (
                        <Image
                          src={featuredImage || "/placeholder.svg"}
                          alt={title}
                          fill
                          className="h-10 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-10 h-10 text-muted-foreground/30"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h4 className="text-xl font-semibold text-black group-hover:text-primary transition-colors">
                        {title}
                      </h4>

                      {partner.acf?.descriptif && (
                        <div
                          className="text-sm text-muted-black mb-4 line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(partner.acf.descriptif.substring(0, 150) + "..."),
                          }}
                        />
                      )}

                      {partner.acf?.lien_vers_le_site && (
                        <a
                          href={partner.acf.lien_vers_le_site.url}
                          target={partner.acf.lien_vers_le_site.target || "_blank"}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                        >
                          <span>{partner.acf.lien_vers_le_site.title || "Visiter le site"}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M7 7h10v10" />
                            <path d="M7 17 17 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

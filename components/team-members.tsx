"use client"
import Link from "next/link"
import type { TeamMember } from "@/lib/wordpress-api"

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

const UserIcon = ({ className }: { className?: string }) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ExternalLinkIcon = ({ className }: { className?: string }) => (
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
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
)

interface TeamMembersProps {
  members: TeamMember[]
}

export function TeamMembers({ members }: TeamMembersProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <UserIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-lg">Aucun membre d'équipe trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const profileImage = member._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        const profileAlt = member._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || member.title.rendered

        return (
          <div
            key={member.id}
            className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
          >
            {/* Photo de profil */}
            <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
              {profileImage ? (
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt={profileAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-6">
              {/* Nom */}
              <h3 className="text-2xl font-bold text-foreground mb-2">{decodeHtmlEntities(member.title.rendered)}</h3>

              {/* Rôle */}
              {member.acf?.role && (
                <p className="text-primary font-medium mb-4">{decodeHtmlEntities(member.acf.role)}</p>
              )}

              {/* Mini bio */}
              {member.acf?.mini_bio && (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground mb-4 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: member.acf.mini_bio }}
                />
              )}

              {/* Liens */}
              {member.acf?.liens && member.acf.liens.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {member.acf.liens.map((linkItem, index) => {
                    if (!linkItem.lien) return null

                    const { url, title, target } = linkItem.lien
                    return (
                      <Link
                        key={index}
                        href={url}
                        target={target || "_self"}
                        rel={target === "_blank" ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                      >
                        {decodeHtmlEntities(title || url)}
                        {target === "_blank" && <ExternalLinkIcon className="w-3 h-3" />}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

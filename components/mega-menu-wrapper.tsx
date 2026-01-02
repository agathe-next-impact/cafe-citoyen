"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface MenuItem {
  parent: string
  parentSlug: string
  parentHref: string
  pages: {
    title: string
    href: string
  }[]
}

export function MegaMenuWrapper() {
  const [menuData, setMenuData] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("/api/wordpress/pages")
        if (response.ok) {
          const data = await response.json()
          setMenuData(data)
        }
      } catch (error) {
        console.error("Error fetching menu data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [])

  if (loading) {
    return (
      <div className="absolute left-1/2 top-full mt-2 w-screen max-w-5xl -translate-x-1/2 pt-4">
        <div className="rounded-lg border border-border bg-popover p-8 shadow-lg">
          <p className="text-center text-sm text-muted-foreground">Chargement des pages...</p>
        </div>
      </div>
    )
  }

  if (menuData.length === 0) {
    return (
      <div className="absolute left-1/2 top-full mt-2 w-screen max-w-5xl -translate-x-1/2 pt-4">
        <div className="rounded-lg border border-border bg-popover p-8 shadow-lg">
          <p className="text-center text-sm text-muted-foreground">
            Aucune page WordPress trouvée. Vérifiez votre connexion à wordpress-starter.fr
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute left-1/2 top-full mt-2 w-screen max-w-5xl -translate-x-1/2 pt-4">
      <div className="rounded-lg border border-border bg-popover p-8 shadow-lg">
        <div className="grid grid-cols-4 gap-8">
          {menuData.map((section) => (
            <div key={section.parentSlug}>
              <Link
                href={section.parentHref}
                className="mb-4 block cursor-pointer text-sm font-semibold uppercase tracking-wider text-primary underline-offset-4 transition-all hover:text-primary/80 hover:underline"
              >
                {section.parent}
              </Link>
              <ul className="space-y-3">
                {section.pages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="group flex items-center gap-2 text-sm transition-colors hover:text-primary"
                    >
                      <span>{page.title}</span>
                      <svg
                        className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Besoin d'aide ?</p>
              <p className="text-sm text-muted-foreground">Contactez notre équipe pour plus d'informations</p>
            </div>
            <Link
              href="/contact"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

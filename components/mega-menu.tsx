"use client"

import Link from "next/link"
import { getWordPressPages, type WordPressPage } from "@/lib/wordpress-api"
import { useEffect, useState } from "react"

const fallbackMenuData = [
  {
    parent: "À propos",
    parentSlug: "a-propos",
    parentHref: "/a-propos",
    pages: [
      { title: "Notre histoire", href: "/a-propos/notre-histoire" },
      { title: "Notre équipe", href: "/a-propos/notre-equipe" },
      { title: "Nos valeurs", href: "/a-propos/nos-valeurs" },
      { title: "Carrières", href: "/a-propos/carrieres" },
    ],
  },
  {
    parent: "Services",
    parentSlug: "services",
    parentHref: "/services",
    pages: [
      { title: "Développement web", href: "/services/developpement-web" },
      { title: "Design UI/UX", href: "/services/design" },
      { title: "Consulting", href: "/services/consulting" },
      { title: "Maintenance", href: "/services/maintenance" },
    ],
  },
  {
    parent: "Solutions",
    parentSlug: "solutions",
    parentHref: "/solutions",
    pages: [
      { title: "E-commerce", href: "/solutions/e-commerce" },
      { title: "Applications web", href: "/solutions/applications-web" },
      { title: "Sites vitrines", href: "/solutions/sites-vitrines" },
      { title: "Plateformes", href: "/solutions/plateformes" },
    ],
  },
  {
    parent: "Ressources",
    parentSlug: "ressources",
    parentHref: "/ressources",
    pages: [
      { title: "Documentation", href: "/ressources/documentation" },
      { title: "Guides", href: "/ressources/guides" },
      { title: "FAQ", href: "/ressources/faq" },
      { title: "Support", href: "/ressources/support" },
    ],
  },
]

export function MegaMenu() {
  const [menuData, setMenuData] = useState<
    { parent: string; parentSlug: string; parentHref: string; pages: { title: string; href: string }[] }[]
  >([])

  useEffect(() => {
    async function loadPages() {
      const pages = await getWordPressPages()
      if (pages.length > 0) {
        const organized = organizePagesByParent(pages)
        setMenuData(organized)
      }
    }
    loadPages()
  }, [])

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  return (
    <div className="absolute left-1/2 top-full mt-2 w-screen max-w-5xl -translate-x-1/2 pt-4">
      <div className="rounded-lg border border-border bg-popover p-8 shadow-lg">
        <div className="grid grid-cols-4 gap-8">
          {menuData.map((section) => (
            <div key={section.parentSlug}>
              <Link
                href={section.parentHref}
                onClick={handleLinkClick}
                className="mb-4 block cursor-pointer text-sm font-semibold uppercase tracking-wider text-primary underline-offset-4 transition-all hover:text-primary/80 hover:underline"
              >
                {section.parent}
              </Link>
              <ul className="space-y-3">
                {section.pages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={handleLinkClick}
                      className="group flex items-center gap-2 text-sm transition-colors hover:text-primary"
                    >
                      <span>{page.title}</span>
                      <svg
                        className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
              onClick={handleLinkClick}
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

function organizePagesByParent(
  pages: WordPressPage[],
): { parent: string; parentSlug: string; parentHref: string; pages: { title: string; href: string }[] }[] {
  const parentPages = pages.filter((page) => page.parent === 0)

  const menuItems = parentPages.map((parent) => {
    const childPages = pages
      .filter((page) => page.parent === parent.id)
      .sort((a, b) => a.menu_order - b.menu_order)
      .map((page) => ({
        title: decodeHtmlEntities(page.title.rendered),
        href: `/${page.slug}`,
      }))

    return {
      parent: decodeHtmlEntities(parent.title.rendered),
      parentSlug: parent.slug,
      parentHref: `/${parent.slug}`,
      pages: childPages,
    }
  })

  return menuItems.filter((item) => item.pages.length > 0)
}

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

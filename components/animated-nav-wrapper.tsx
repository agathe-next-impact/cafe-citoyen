"use client"

import { useMemo } from "react"
import { AnimatedNav } from "./animated-nav"
import type { NavItem } from "./animated-nav"
import { type SiteOptions } from "@/lib/wordpress-api"

type MenuSection = {
  parent: string;
  parentSlug: string;
  parentHref: string;
  pages: { title: string; href: string }[];
};

type AnimatedNavWrapperProps = {
  siteOptions: SiteOptions | null;
  menuData: MenuSection[];
};

export function AnimatedNavWrapper({ siteOptions, menuData }: AnimatedNavWrapperProps) {
  const navItems = useMemo<NavItem[]>(() => {
    if (menuData.length === 0) return []

    const cardColors = [
      'yellow-100',
      'red-100',
      'yellow-100',
      'blue-100',
      'emerald-100',
      'violet-100',
    ];

    const items: NavItem[] = menuData.map((section, idx) => ({
      label: section.parent,
      bgColor: cardColors[idx] || 'gray-100',
      textColor: 'oklch(0.25 0.02 85)',
      links: [
        {
          label: `Voir ${section.parent}`,
          href: section.parentHref,
        },
        ...section.pages.map((page) => ({
          label: page.title,
          href: page.href,
        })),
      ],
    }))

    while (items.length < 6) {
      items.push({
        label: "",
        bgColor: "white",
        textColor: "oklch(0.25 0.02 85)",
        links: [],
      })
    }

    return items
  }, [menuData])

  return (
    <div className="absolute z-100">      
      <AnimatedNav
        logo={siteOptions?.logo_du_site?.url || ""}
        items={navItems}
        agendaLink="/la-programmation"
        reseaux_sociaux={siteOptions?.reseaux_sociaux ?? []}
      />
    </div>
  )
}

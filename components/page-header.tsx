"use client";
import { useEffect, useRef, useState } from "react";
import { WPDecode } from "@/components/wp-decode"; // Utilisation du composant externe
import { decodeHtmlEntities } from "@/lib/decode";
import Image from "next/image";


type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  slug?: string;
  childPages?: Array<{ id: number; title: { rendered: string }; slug: string }>;
  allPages?: any[];
  parentPage?: { id: number; title: { rendered: string }; slug: string; path?: string };
};


const MEGAMENU_CARD_COLOR_GROUPS: Array<{
  slugs: string[],
  bg: string,
  border: string
}> = [
  {
    slugs: ["innovation-citoyenne", "le-tiers-lieu", "equipe", "histoire", "partenaires", "actualites", "etats-generaux-communaux", "les-doleances", "reseau"],
    bg: "bg-purple-50/50",
    border: "border-purple-500/10"
  },
  {
    slugs: ["cafe-citoyen", "bistrot", "circuits-courts", "causeries", "jeux-de-societe", "food-truck"],
    bg: "bg-red-50/50",
    border: "border-red-500/10"
  },
  {
    slugs: ["saison-culturelle", "ateliers", "maison-dedition", "musique", "residences", "spectacle-vivant", "theatre"],
    bg: "bg-yellow-50/50",
    border: "border-yellow-500/10"
  },
  {
    slugs: ["la-maison-du-vivant", "ateliers", "cuisine-en-commun", "fablab", "gite-communal", "lieux-de-repit", "agenda"],
    bg: "bg-emerald-50/50",
    border: "border-emerald-500/10"
  },
  {
    slugs: ["infos-pratiques", "autour-de-nous", "contact", "foire-aux-questions", "venir"],
    bg: "bg-blue-50/50",
    border: "border-blue-500/10"
  }
];



function getBadgeStyle(slug?: string) {
  if (!slug) {
    return { bg: "bg-gray-500", border: "border-gray-500" };
  }
  for (const group of MEGAMENU_CARD_COLOR_GROUPS) {
    if (group.slugs.includes(slug)) {
      const baseBg = group.bg.replace("/50", ""); // handle bg-xxx-50/50 variants
      if (baseBg === "bg-purple-50") return { bg: "bg-purple-500", border: "border-purple-500" };
      if (baseBg === "bg-red-50") return { bg: "bg-red-500", border: "border-red-500" };
      if (baseBg === "bg-yellow-50") return { bg: "bg-yellow-500", border: "border-yellow-500" };
      if (baseBg === "bg-emerald-50") return { bg: "bg-emerald-500", border: "border-emerald-500" };
      if (baseBg === "bg-blue-50") return { bg: "bg-blue-500", border: "border-blue-500" };
    }
  }
  return { bg: "bg-gray-500", border: "border-gray-500" };
}



const BALL_IMAGES = [
  "/images/fichier-201-404x-1.png",
  "/images/fichier-202-404x-2.png",
  "/images/fichier-204-404x-3.png",
  "/images/fichier-205-404x-4.png",
  "/images/fichier-203-404x-2.png",
];

export default function PageHeader({ title, subtitle, backgroundImage, backgroundAlt, slug, childPages, allPages, parentPage }: PageHeaderProps) {
  // Animation state
  const [anim, setAnim] = useState(0);
  const requestRef = useRef<number | null>(null);
  
  useEffect(() => {
    let running = true;
    const animate = () => {
      setAnim((a) => a + 0.003);
      if (running) requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);


  return (
    <section className={`-mt-20 pt-16 relative min-h-100 flex items-end overflow-visible border-b-1 border-black`}>
      {/* Image de fond */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt={backgroundAlt || title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}
      
      {/* Halo radial en haut de page */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-50"
      />
      
      <div className="w-full mx-auto relative z-10">
        <div className="flex gap-8">
          <div className="flex-1 gap-4 bg-black text-white py-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-balance mb-4 ml-4 text-white">
              <WPDecode>{decodeHtmlEntities(title)}</WPDecode>
            </h1>
                <span className="ml-4">{subtitle && <WPDecode>{decodeHtmlEntities(subtitle)}</WPDecode>}</span>
                
            {parentPage && (
              <div className="flex flex-wrap gap-1 mt-6 pt-1 bg-black">
                <a
                  href={getPagePath(parentPage, allPages || [])}
                  className="inline-flex items-center px-4 py-1 mb-1 text-base bg-white text-black"
                >
                  <WPDecode>{parentPage.title.rendered}</WPDecode>
                </a>
              </div>
            )}

            {childPages && childPages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-6 pt-1 bg-black">
                {childPages.map((childPage) => {
                    const href = allPages ? getPagePath(childPage, allPages) : `/${childPage.slug}`;
                    const badgeStyle = getBadgeStyle(childPage.slug);
                  return (
                    <a
                      key={childPage.id}
                      href={href}
                      className={`inline-flex items-center px-4 py-1 mb-1 text-base bg-white text-black`}
                    >
                      <WPDecode>{decodeHtmlEntities(childPage.title.rendered)}</WPDecode>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper to get the page path from a child page and all pages
function getPagePath(childPage: { slug: string }, allPages: any[]): string {
  // Try to find the page in allPages by id or slug
  const found = allPages.find(
    (p) => p.id === childPage.id || p.slug === childPage.slug
  );
  // If found and has a path, return it; otherwise fallback to /slug
  if (found && found.path) return found.path;
  return `/${childPage.slug}`;
}





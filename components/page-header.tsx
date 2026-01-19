"use client";
import { useEffect, useRef, useState } from "react";
import { WPDecode } from "@/components/wp-decode"; // Utilisation du composant externe


type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundAlt?: string;
  slug?: string;
  childPages?: Array<{ id: number; title: { rendered: string }; slug: string }>;
  allPages?: any[];
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

function getMegaMenuCardStyle(slug?: string) {
  if (!slug) {
    return { bg: "bg-gray-50", border: "border-gray-300" };
  }
  for (const group of MEGAMENU_CARD_COLOR_GROUPS) {
    if (group.slugs.includes(slug)) {
      return { bg: group.bg, border: group.border };
    }
  }
  return { bg: "bg-gray-50", border: "border-gray-300" };
}

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

function getColorRgb(slug?: string): string {
  if (!slug) {
    return "107, 114, 128"; // gray-500
  }
  for (const group of MEGAMENU_CARD_COLOR_GROUPS) {
    if (group.slugs.includes(slug)) {
      const baseBg = group.bg.replace("/50", "");
      if (baseBg === "bg-purple-50") return "168, 85, 247"; // purple-500
      if (baseBg === "bg-red-50") return "239, 68, 68"; // red-500
      if (baseBg === "bg-yellow-50") return "234, 179, 8"; // yellow-500
      if (baseBg === "bg-emerald-50") return "16, 185, 129"; // emerald-500
      if (baseBg === "bg-blue-50") return "59, 130, 246"; // blue-500
    }
  }
  return "107, 114, 128"; // gray-500
}


const BALL_IMAGES = [
  "/images/fichier-201-404x-1.png",
  "/images/fichier-202-404x-2.png",
  "/images/fichier-204-404x-3.png",
  "/images/fichier-205-404x-4.png",
  "/images/fichier-203-404x-2.png",
];

export default function PageHeader({ title, subtitle, backgroundImage, backgroundAlt, slug, childPages, allPages }: PageHeaderProps) {
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

  // Création de 3 lignes de balles
  const lines = [
    {
      Y1: 80, Y2: 40, Y3: 100,
      yOffset: -40,
      tList: [0.20, 0.50, 0.80],
      baseY: [20, 25, 18],
      radius: [15, 20, 12],
      phase: [0, 0.8, 1.5],
      colorPattern: [0, 1, 2]
    },
    {
      Y1: 120, Y2: 60, Y3: 140,
      yOffset: 0,
      tList: [0.10, 0.22, 0.41, 0.65, 0.87],
      baseY: [30, 36, 24, 72, 28],
      radius: [18, 24, 14, 20, 16],
      phase: [0, 0.7, 1.2, 2.1, 2.8],
      colorPattern: [4, 3, 2, 1, 0]
    },
    {
      Y1: 160, Y2: 100, Y3: 180,
      yOffset: 40,
      tList: [0.15, 0.35, 0.55, 0.85],
      baseY: [40, 45, 35, 55],
      radius: [20, 26, 16, 22],
      phase: [0.5, 1.2, 1.8, 2.6],
      colorPattern: [2, 3, 4, 0]
    }
  ];

  const allBallPositions = lines.map(line => {
    return line.tList.map(t => {
      let x, y;
      if (t <= 0.5) {
        const localT = t / 0.5;
        x = 0 + (960 - 0) * t * 2;
        y = quadBezier(localT, 80 + line.yOffset, line.Y1, line.Y2);
      } else {
        const localT = (t - 0.5) / 0.5;
        x = 960 + (1920 - 960) * (t - 0.5) * 2;
        const ctrl = (line.Y1 + line.Y2) / 2;
        y = quadBezier(localT, line.Y2, ctrl, line.Y3);
      }
      return { x, y: y + line.yOffset };
    });
  });

  const { bg, border } = getMegaMenuCardStyle(slug);
  const colorRgb = getColorRgb(slug);

  return (
    <section className={`-mt-16 pt-16 relative min-h-50 flex items-center overflow-visible ${bg} border-b-2 ${border}`}>
      {/* Halo radial en haut de page */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage:
            `radial-gradient(ellipse at -10% -60%, rgba(${colorRgb},0.4) 0%, rgba(${colorRgb},0.05) 38%, white 60%), linear-gradient(to bottom, transparent 0%, white 70%, rgba(255,255,255,0.3) 100%)`,
        }}
      />
      {/* Ligne courbe SVG en arrière-plan */}
      <div className="pointer-events-none absolute left-2/5 w-full mt-20 z-0">
        {/* 3 lignes de balles animées */}
        {lines.map((line, lineIndex) => (
          allBallPositions[lineIndex].map((ballPos, ballIndex) => {
            // theta varie de pi à 0 pour un demi-cercle bas
            const theta = Math.PI + Math.sin(anim + line.phase[ballIndex]) * Math.PI;
            const xOffset = Math.cos(theta) * line.radius[ballIndex];
            const yOffset = Math.sin(theta) * line.radius[ballIndex] + line.baseY[ballIndex];
            return (
              <img
                key={`line-${lineIndex}-ball-${ballIndex}`}
                src={BALL_IMAGES[line.colorPattern[ballIndex]]}
                alt="balle décorative"
                style={{
                  position: 'absolute',
                  left: `calc(${((ballPos.x / 1920) * 100).toFixed(2)}% - 24px + ${xOffset.toFixed(2)}px)`,
                  top: `${(ballPos.y - 240 + yOffset).toFixed(2)}px`,
                  width: '48px',
                  height: '48px',
                  pointerEvents: 'none',
                  zIndex: 2,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15)) drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                }}
              />
            );
          })
        )).flat()}
      </div>
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-start justify-between gap-8 pt-12">
          <div className="flex-1 gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-balance mb-4 text-black">
              <WPDecode>{title}</WPDecode>
            </h1>
            {subtitle && (
              <div
                className={`rounded-2xl shadow-md px-6 py-4 max-w-2xl mt-8 border bg-white/80 ${border}`}
              >
                <WPDecode>{subtitle}</WPDecode>
              </div>
            )}
            {childPages && childPages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {childPages.map((childPage) => {
                    const href = allPages ? getPagePath(childPage, allPages) : `/${childPage.slug}`;
                    const badgeStyle = getBadgeStyle(childPage.slug);
                  return (
                    <a
                      key={childPage.id}
                      href={href}
                      className={`inline-flex items-center px-4 py-1 rounded-full text-base text-white border-2 transition-all hover:scale-105 ${badgeStyle.bg} ${badgeStyle.border} hover:shadow-md`}
                    >
                      <WPDecode>{childPage.title.rendered}</WPDecode>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          {backgroundImage && (
            <div className="shrink-0 relative bg-white">
              <div
                className="relative w-64 h-56 md:w-56 md:h-64 lg:w-64 lg:h-72 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt={backgroundAlt || title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          )}
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

// Utilitaire de courbe quadratique (inchangé)
function quadBezier(t: number, p0: number, p1: number, p2: number) {
  return (
    (1 - t) * (1 - t) * p0 +
    2 * (1 - t) * t * p1 +
    t * t * p2
  );
}



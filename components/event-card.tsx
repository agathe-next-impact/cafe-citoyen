import React from "react";
import Image from "next/image";
import { cn } from "../lib/utils";

type CategoryTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  acf?: {
    couleur_associee?: string;
  };
};

type EventCardProps = {
  event: any;
  decodeHtmlEntities: (str: string) => string;
  getCategoryVariant: (catName?: string) => string;
  variantColors: Record<string, { badge: string }>;
  variantBorderColors: Record<string, string>;
};

const EventCard: React.FC<EventCardProps> = React.memo(({
  event,
  decodeHtmlEntities,
  getCategoryVariant,
  variantColors,
  variantBorderColors,
}) => {
  const cat = event._embedded?.["wp:term"]?.flat().find(
    (term: CategoryTerm) => term.taxonomy === "category"
  ) as CategoryTerm | undefined;
  const categoryName = cat ? decodeHtmlEntities(cat.name) : undefined;
  const categoryColor = cat?.acf?.couleur_associee;
  const variant = getCategoryVariant(categoryName);
  const featuredImage = event._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  // Get event tags
  const eventTags = event._embedded?.["wp:term"]?.flat()
    .filter((term: any) => term.taxonomy === "post_tag")
    .map((term: any) => decodeHtmlEntities(term.name)) || [];

  return (
    <div
      key={event.id}
      className="group bg-card overflow-hidden transition-all duration-300 border-2 border-black flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          {categoryName && (
            <span
              className={cn(
                "w-full inline-flex items-center px-4 py-2 font-medium border-2",
                !categoryColor && (variantColors[variant]?.badge || variantColors["chart-1"].badge),
                !categoryColor && (variantBorderColors[variant] || "border-border")
              )}
              style={categoryColor ? { background: categoryColor, color: "#000", borderColor: categoryColor } : undefined}
            >
              {categoryName}
            </span>
          )}
        </div>
        {eventTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {eventTags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-black backdrop-blur-sm text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="p-4 flex-1">
          <h3
            className={cn(
              "text-xl font-semibold mb-3 transition-colors group-hover:text-primary",
              categoryColor && "group-hover:text-(--cat-color)"
            )}
            style={categoryColor ? { color: "#000", ["--cat-color"]: categoryColor } as React.CSSProperties : { color: "#000" }}
          >
            {decodeHtmlEntities(event.title.rendered)}
          </h3>
          {event.acf?.date_de_debut && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <svg className="w-4 h-4" style={categoryColor ? { color: categoryColor } : {}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              <span>
                {(() => {
                  const [day, month, year] = event.acf.date_de_debut.split("/").map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                })()}
                {event.acf.date_de_fin && (() => {
                  const [day, month, year] = event.acf.date_de_fin.split("/").map(Number);
                  const date = new Date(year, month - 1, day);
                  return ' - ' + date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                })()}
              </span>
            </div>
          )}
          {event.acf?.heure_de_debut && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4" style={categoryColor ? { color: categoryColor } : {}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <span>{event.acf.heure_de_debut}{event.acf.heure_de_fin && ` - ${event.acf.heure_de_fin}`}</span>
            </div>
          )}
          {event.acf?.["sous-titre"] && (
            <div className="text-base text-muted-foreground mt-2">
              {decodeHtmlEntities(event.acf["sous-titre"])}
            </div>
          )}
        </div>
      </div>
      <div className="relative aspect-square overflow-hidden">
        {featuredImage ? (
          <>
            <Image
              src={featuredImage || "/placeholder.svg"}
              alt={event.title.rendered}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
            />
            {event.acf?.descriptif && (
              <div className="absolute inset-x-0 bottom-0 bg-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                  {decodeHtmlEntities(event.acf.descriptif.replace(/<[^>]*>/g, ""))}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <svg className="w-16 h-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
          </div>
        )}
      </div>
    </div>
  );
});

EventCard.displayName = "EventCard";

export default EventCard;
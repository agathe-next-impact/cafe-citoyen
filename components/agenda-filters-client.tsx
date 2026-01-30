"use client";
import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getCategoryVariant } from "@/lib/category-colors";
import { variantColors } from "@/components/ui/site-card";
import { decodeHtmlEntities } from "@/lib/decode";

const variantBorderColors: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary",
  "chart-1": "border-chart-1",
  "chart-2": "border-chart-2",
  "chart-3": "border-chart-3",
  "chart-4": "border-chart-4",
  "chart-5": "border-chart-5",
  info: "border-blue-500",
  partner: "border-green-500",
};

const variantSelectedBg: Record<string, string> = {
  primary: "bg-primary text-primary-foreground border-primary",
  secondary: "bg-secondary text-secondary-foreground border-secondary",
  "chart-1": "bg-chart-1 text-white border-chart-1",
  "chart-2": "bg-chart-2 text-white border-chart-2",
  "chart-3": "bg-chart-3 text-white border-chart-3",
  "chart-4": "bg-chart-4 text-white border-chart-4",
  "chart-5": "bg-chart-5 text-white border-chart-5",
  info: "bg-blue-500 text-white border-blue-500",
  partner: "bg-green-500 text-white border-green-500",
};

export type AgendaFiltersClientProps = {
  categories: string[];
  tags: string[];
  events: any[];
};

export default function AgendaFiltersClient({ categories, tags, events }: AgendaFiltersClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    events.forEach(event => {
      const terms = event._embedded?.["wp:term"]?.flat() || [];
      terms.forEach((term: any) => {
        if (term?.taxonomy === "category" && term?.acf?.couleur_associee) {
          const name = decodeHtmlEntities(term.name);
          map[name] = term.acf.couleur_associee;
        }
      });
    });
    return map;
  }, [events]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    events.forEach(event => {
      const terms = event._embedded?.["wp:term"]?.flat() || [];
      terms.forEach((term: any) => {
        if (term?.taxonomy === "post_tag" && term?.name) {
          tagSet.add(decodeHtmlEntities(term.name));
        }
      });
    });
    tags.forEach(tag => tagSet.add(tag));
    return Array.from(tagSet);
  }, [events, tags]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventCategories = event._embedded?.["wp:term"]?.flat()
        .filter((term: any) => term.taxonomy === "category")
        .map((term: any) => decodeHtmlEntities(term.name)) || [];
      const eventTags = event._embedded?.["wp:term"]?.flat()
        .filter((term: any) => term.taxonomy === "post_tag")
        .map((term: any) => decodeHtmlEntities(term.name)) || [];
      const catMatch = selectedCategories.length === 0 || selectedCategories.some(cat => eventCategories.includes(cat));
      const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => eventTags.includes(tag));
      return catMatch && tagMatch;
    });
  }, [events, selectedCategories, selectedTags]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const variant = getCategoryVariant(cat)
          const variantBorder = variantBorderColors[variant] || "border-border"
          const selectedBg = variantSelectedBg[variant] || "bg-primary text-primary-foreground border-primary"
          const categoryColor = categoryColors[cat]
          const selectedStyle = categoryColor
            ? { backgroundColor: categoryColor, borderColor: categoryColor, color: "#fff" }
            : undefined
          const idleStyle = categoryColor
            ? { borderColor: categoryColor, color: "#000" }
            : { color: "#000" }
          return (
            <button
              key={cat}
              className={cn(
                "px-3 py-1 text-sm font-medium border-2 transition-colors bg-white",
                categoryColor ? "" : variantBorder,
                selectedCategories.includes(cat)
                  ? selectedBg
                  : "text-muted-foreground"
              )}
              style={selectedCategories.includes(cat) ? selectedStyle : idleStyle}
              onClick={() => setSelectedCategories(selectedCategories.includes(cat)
                ? selectedCategories.filter(c => c !== cat)
                : [...selectedCategories, cat])}
              type="button"
            >
              {cat}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {availableTags.map(tag => (
          <button
            key={tag}
            className={cn(
              "px-3 py-1 text-xs font-medium border-2 transition-colors border-black",
              selectedTags.includes(tag)
                ? "bg-black text-white"
                : "bg-white text-foreground"
            )}
            onClick={() => setSelectedTags(selectedTags.includes(tag)
              ? selectedTags.filter(t => t !== tag)
              : [...selectedTags, tag])}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>
      {filteredEvents.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Événements à venir</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredEvents.map((event) => {
              type CategoryTerm = {
                id: number;
                name: string;
                slug: string;
                taxonomy: string;
                acf?: {
                  couleur_associee?: string;
                };
              };
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
                        <img
                          src={featuredImage || "/placeholder.svg"}
                          alt={event.title.rendered}
                          className="w-full h-full object-cover group-hover:blur-sm transition-all duration-500"
                          loading="lazy"
                          decoding="async"
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
            })}
          </div>
        </section>
      )}
    </>
  );
}

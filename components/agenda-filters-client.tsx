"use client";
import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getCategoryVariant } from "@/lib/category-colors";
import { variantColors } from "@/components/ui/site-card";
import { decodeHtmlEntities } from "@/lib/decode";

import EventCard from "./event-card";

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
      <div className="flex flex-wrap gap-2 mb-4">
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
      <div className="flex flex-wrap gap-2 mb-10">
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
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Événements à venir</h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                decodeHtmlEntities={decodeHtmlEntities}
                getCategoryVariant={getCategoryVariant}
                variantColors={variantColors}
                variantBorderColors={variantBorderColors}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

"use client"

import { useState } from "react"

interface EventsFiltersProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onSeasonChange: (season: string) => void
  onPartnerChange: (partner: string) => void
  categories: string[]
  seasons: string[]
  partners: string[]
}

export function EventsFilters({
  onSearchChange,
  onCategoryChange,
  onSeasonChange,
  onPartnerChange,
  categories,
  seasons,
  partners,
}: EventsFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSeason, setSelectedSeason] = useState("")
  const [selectedPartner, setSelectedPartner] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
    scrollToTop()
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onCategoryChange(value)
    scrollToTop()
  }

  const handleSeasonChange = (value: string) => {
    setSelectedSeason(value)
    onSeasonChange(value)
    scrollToTop()
  }

  const handlePartnerChange = (value: string) => {
    setSelectedPartner(value)
    onPartnerChange(value)
    scrollToTop()
  }

  const clearAllFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setSelectedSeason("")
    setSelectedPartner("")
    onSearchChange("")
    onCategoryChange("")
    onSeasonChange("")
    onPartnerChange("")
    scrollToTop()
  }

  const activeFiltersCount = [selectedCategory, selectedSeason, selectedPartner].filter(Boolean).length

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-sm">
      {/* Search Bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un événement..."
          className="w-full pl-12 pr-4 py-3 bg-background rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        )}
      </div>

      {/* Filters Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-muted/50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-medium">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-white rounded-full">{activeFiltersCount}</span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-muted-foreground">
              Catégorie
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label htmlFor="season" className="block text-sm font-medium mb-2 text-muted-foreground">
              Saison culturelle
            </label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="w-full px-4 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Toutes les saisons</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>

          {/* Partner Filter */}
          <div>
            <label htmlFor="partner" className="block text-sm font-medium mb-2 text-muted-foreground">
              Partenaire
            </label>
            <select
              id="partner"
              value={selectedPartner}
              onChange={(e) => handlePartnerChange(e.target.value)}
              className="w-full px-4 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">Tous les partenaires</option>
              {partners.map((partner) => (
                <option key={partner} value={partner}>
                  {partner}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

import type { WPPost, WPPage, GlobalOptionsACF, WPMenuItem, WPTerm, TeamMemberACF } from "./types"
import { decodeObjectEntities } from "./decode"

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || "https://wordpress-starter.fr/wp-json/wp/v2"

export class WordPressAPI {
  private baseUrl: string
  private wpJsonBase: string

  constructor(baseUrl: string = WP_API_URL) {
    this.baseUrl = baseUrl
    this.wpJsonBase = baseUrl.replace("/wp/v2", "")
  }

  private async fetch<T>(endpoint: string, params?: Record<string, any>, retries = 2): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // Increased to 15s

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "Next.js WordPress Client",
        },
        signal: controller.signal,
        next: { revalidate: 21600 }, // Cache for 6 hours instead of 4 hours
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const body = await response.text()
        console.error(`[v0] WordPress API error - Status: ${response.status}`)
        console.error(`[v0] WordPress API error - Body:`, body.substring(0, 500))

        // For 404 errors, return empty array for list endpoints
        if (response.status === 404) {
          if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
            console.warn(`[v0] Returning empty array for 404 on endpoint: ${endpoint}`)
            return [] as T
          }
        }

        if (response.status >= 500 && retries > 0) {
          console.warn(`[v0] Retrying request (${retries} retries left)...`)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000))
          return this.fetch<T>(endpoint, params, retries - 1)
        }

        if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
          console.error(`[v0] Returning empty array due to error on endpoint: ${endpoint}`)
          return [] as T
        }

        throw new Error(
          `WordPress API error (${response.status}): ${response.statusText}. Check server logs for details.`,
        )
      }

      const data = await response.json()
      return decodeObjectEntities(data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error(`[v0] Request timeout for ${url}`)

          // Retry on timeout
          if (retries > 0) {
            console.warn(`[v0] Retrying after timeout (${retries} retries left)...`)
            await new Promise((resolve) => setTimeout(resolve, 3000)) // 3s delay between retries
            return this.fetch<T>(endpoint, params, retries - 1)
          }
        } else if (error.message.includes("fetch")) {
          console.error(`[v0] Network error fetching ${url}:`, error.message)

          // Retry on network error
          if (retries > 0) {
            console.warn(`[v0] Retrying after network error (${retries} retries left)...`)
            await new Promise((resolve) => setTimeout(resolve, 3000)) // 3s delay between retries
            return this.fetch<T>(endpoint, params, retries - 1)
          }
        }
      }

      // For list endpoints, return empty array on error
      if (endpoint.includes("?") || !/\/\d+$/.test(endpoint)) {
        console.error(`[v0] Returning empty array due to error for endpoint: ${endpoint}`)
        return [] as T
      }

      throw error
    }
  }

  // Pages
  async getPages(params?: { parent?: number; per_page?: number }): Promise<WPPage[]> {
    console.warn("[v0] WordPress API - getPages() called with params:", params)

    const perPage = 100 // WordPress maximum
    let allPages: WPPage[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const pages = await this.fetch<WPPage[]>("/pages", {
        _embed: true,
        acf_format: "standard",
        per_page: perPage,
        page: page,
        orderby: "menu_order",
        order: "asc",
        ...params,
      })

      if (pages.length === 0) {
        hasMore = false
      } else {
        allPages = [...allPages, ...pages]
        if (pages.length < perPage) {
          hasMore = false
        } else {
          page++
        }
      }
    }

    console.warn("[v0] WordPress API - Total pages fetched:", allPages.length)
    return allPages
  }

  async getPageBySlug(slug: string): Promise<WPPage | null> {
    const pages = await this.fetch<WPPage[]>("/pages", {
      slug,
      _embed: true,
      acf_format: "standard",
    })

    if (pages[0]) {
      console.warn("[v0] WordPress API - Full page data for slug:", slug)
      console.warn("[v0] Full page object:", JSON.stringify(pages[0], null, 2))
      console.warn("[v0] Page title:", pages[0].title?.rendered)
      console.warn("[v0] Page ACF data:", JSON.stringify(pages[0].acf, null, 2))

      if (pages[0].acf?.hero) {
        console.warn("[v0] Hero sous-titre:", pages[0].acf.hero["sous-titre"])
        console.warn("[v0] Hero image:", pages[0].acf.hero.image)
      } else {
        console.warn("[v0] WARNING: No hero data found in ACF")
      }
    } else {
      console.warn("[v0] WARNING: No page found for slug:", slug)
    }

    return pages[0] || null
  }

  async getPageByPath(path: string): Promise<WPPage | null> {
    const cleanPath = path.replace(/^\/+|\/+$/g, "")

    console.warn("[v0] WordPress API - getPageByPath() called with path:", cleanPath)

    const allPages = await this.getPages()

    console.warn("[v0] WordPress API - Total pages fetched:", allPages.length)

    // Find page that matches the full path
    const page = allPages.find((p) => {
      // WordPress link contains the full URL, extract the path
      const pageUrl = p.link || ""
      const wpBaseUrl = this.baseUrl.replace("/wp-json/wp/v2", "")
      const pagePath = pageUrl.replace(wpBaseUrl, "").replace(/^\/+|\/+$/g, "")

      console.warn(`[v0] Comparing: "${pagePath}" === "${cleanPath}"`)

      return pagePath === cleanPath
    })

    if (page) {
      console.warn("[v0] WordPress API - Found page by path:", page.title.rendered)
      console.warn("[v0] Page link:", page.link)
    } else {
      console.warn("[v0] WordPress API - No page found for path:", cleanPath)
    }

    return page || null
  }

  async getPageById(id: number): Promise<WPPage> {
    return this.fetch<WPPage>(`/pages/${id}`, {
      _embed: true,
      acf_format: "standard",
    })
  }

  // Custom Post Types
  async getPosts<T = any>(
    postType: string,
    params?: { per_page?: number; orderby?: string; order?: string },
  ): Promise<WPPost<T>[]> {
    console.warn("[v0] WordPress API - getPosts() called for postType:", postType)
    console.warn("[v0] WordPress API - Full URL will be:", `${this.baseUrl}/${postType}`)

    try {
      const result = await this.fetch<WPPost<T>[]>(`/${postType}`, {
        _embed: true,
        acf_format: "standard",
        per_page: params?.per_page || 100,
        ...params,
      })

    
      return result
    } catch (error) {
      return []
    }
  }

  async getPostBySlug<T = any>(postType: string, slug: string): Promise<WPPost<T> | null> {
    const posts = await this.fetch<WPPost<T>[]>(`/${postType}`, {
      slug,
      _embed: true,
      acf_format: "standard",
    })
    return posts[0] || null
  }

  async getPostById<T = any>(postType: string, id: number): Promise<WPPost<T>> {
    return this.fetch<WPPost<T>>(`/${postType}/${id}`, {
      _embed: true,
      acf_format: "standard",
    })
  }

  // Specific post types
  async getSejours() {
    console.warn("[v0] WordPress API - getSejours() called")

    try {
      // Fetch sejours with embedded data
      const sejours = await this.getPosts("sejour")

      console.warn("[v0] Sejours fetched:", sejours.length)

      const extractSlugFromUrl = (url: string): string | null => {
        try {
          // URL format: https://wp-asso.com/hebergement/maison-forestiere/
          const urlParts = url.split("/").filter((part) => part.length > 0)
          // Get the last part as slug
          return urlParts[urlParts.length - 1] || null
        } catch (error) {
          console.error("[v0] Error extracting slug from URL:", url, error)
          return null
        }
      }

      // For each sejour, fetch complete data for hebergements and activites
      const sejoursWithCompleteData = await Promise.all(
        sejours.map(async (sejour) => {
          try {
            console.warn("[v0] Processing sejour:", sejour.title?.rendered || "Unknown")

            if (!sejour.acf) {
              console.warn("[v0] Sejour has no ACF data:", sejour.id)
              return sejour
            }

            if (sejour.acf?.hebergements?.hebergements && Array.isArray(sejour.acf.hebergements.hebergements)) {
              try {
                sejour.acf.hebergements.hebergements = await Promise.all(
                  sejour.acf.hebergements.hebergements.map(async (urlOrItem: any) => {
                    try {
                      // If it's a string URL, extract slug and fetch
                      if (typeof urlOrItem === "string") {
                        const slug = extractSlugFromUrl(urlOrItem)
                        if (slug) {
                          const fullHebergement = await this.getPostBySlug("hebergement", slug)
                          if (fullHebergement) {
                            console.warn(
                              "[v0] Fetched hebergement from URL:",
                              fullHebergement.title?.rendered || "Unknown",
                              fullHebergement.slug,
                            )
                            return { hebergement: fullHebergement }
                          }
                        }
                      }
                      // If it's already an object with ID
                      else if (urlOrItem?.hebergement?.ID) {
                        const fullHebergement = await this.getPostById("hebergement", urlOrItem.hebergement.ID)
                        console.warn(
                          "[v0] Fetched hebergement from ID:",
                          fullHebergement.title?.rendered || "Unknown",
                          fullHebergement.slug,
                        )
                        return { hebergement: fullHebergement }
                      }
                    } catch (error) {
                      console.error(
                        "[v0] Error fetching hebergement, skipping:",
                        error instanceof Error ? error.message : error,
                      )
                      // Return null for failed items so they can be filtered out
                      return null
                    }
                    return urlOrItem
                  }),
                )
                // Filter out null values from failed fetches
                sejour.acf.hebergements.hebergements = sejour.acf.hebergements.hebergements.filter(
                  (item) => item !== null,
                )
              } catch (error) {
                console.error(
                  "[v0] Error processing hebergements array:",
                  error instanceof Error ? error.message : error,
                )
                // Keep original data if processing fails
              }
            }

            if (sejour.acf?.activites?.activite && Array.isArray(sejour.acf.activites.activite)) {
              try {
                sejour.acf.activites.activite = await Promise.all(
                  sejour.acf.activites.activite.map(async (urlOrItem: any) => {
                    try {
                      // If it's a string URL, extract slug and fetch
                      if (typeof urlOrItem === "string") {
                        const slug = extractSlugFromUrl(urlOrItem)
                        if (slug) {
                          const fullActivite = await this.getPostBySlug("activite", slug)
                          if (fullActivite) {
                            console.warn(
                              "[v0] Fetched activite from URL:",
                              fullActivite.title?.rendered || "Unknown",
                              fullActivite.slug,
                            )
                            return { activite: fullActivite }
                          }
                        }
                      }
                      // If it's already an object with ID
                      else if (urlOrItem?.activite?.ID) {
                        const fullActivite = await this.getPostById("activite", urlOrItem.activite.ID)
                        console.warn(
                          "[v0] Fetched activite from ID:",
                          fullActivite.title?.rendered || "Unknown",
                          fullActivite.slug,
                        )
                        return { activite: fullActivite }
                      }
                    } catch (error) {
                      console.error(
                        "[v0] Error fetching activite, skipping:",
                        error instanceof Error ? error.message : error,
                      )
                      // Return null for failed items so they can be filtered out
                      return null
                    }
                    return urlOrItem
                  }),
                )
                // Filter out null values from failed fetches
                sejour.acf.activites.activite = sejour.acf.activites.activite.filter((item) => item !== null)
              } catch (error) {
                console.error("[v0] Error processing activites array:", error instanceof Error ? error.message : error)
                // Keep original data if processing fails
              }
            }

            return sejour
          } catch (error) {
            console.error("[v0] Error processing sejour:", sejour.id, error instanceof Error ? error.message : error)
            return sejour
          }
        }),
      )

      console.warn("[v0] Sejours with complete data:", sejoursWithCompleteData.length)
      return sejoursWithCompleteData
    } catch (error) {
      console.error("[v0] Error in getSejours():", error instanceof Error ? error.message : error)
      return []
    }
  }

  async getHebergements() {
    console.warn("[v0] WordPress API - getHebergements() called")
    const result = await this.getPosts("hebergement")
    console.warn("[v0] WordPress API - getHebergements() result count:", result.length)
    return result
  }

  async getActivites() {
    console.warn("[v0] WordPress API - getActivites() method called - START")

    try {
      const activites = await this.getPosts("activite")
      console.warn("[v0] WordPress API - getActivites() returned:", activites.length, "activités")

      if (activites.length > 0) {

        if (activites[0].acf) {
          console.warn("[v0] Activité nom:", activites[0].acf.nom)
          console.warn("[v0] Activité descriptif:", activites[0].acf.descriptif)
        } else {
          console.warn("[v0] WARNING: No ACF data found for activité")
        }
      } else {
        console.warn("[v0] WARNING: No activités found in WordPress")
      }

      return activites
    } catch (error) {
      console.error("[v0] ERROR: Failed to fetch activités from WordPress API:", error)
      console.error("[v0] This usually means the CPT 'activite' is not registered or not exposed in REST API")
      console.error("[v0] Please check WordPress CPT configuration: show_in_rest should be true")
      return []
    }
  }

  async getEvenements() {
    return this.getPosts("evenement", { orderby: "date", order: "desc" })
  }

  async getPartenaires() {
    return this.getPosts("partenaire")
  }

  async getStructures() {
    const structures = await this.getPosts("structure")

    return structures.map((structure) => ({
      ...structure,
      featured_media_url: structure._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    }))
  }

  async getEspacesDeTravail() {
    console.warn("[v0] WordPress API - getEspacesDeTravail() called")
    return this.getPosts("espace-de-travail")
  }

  async getVisitePage() {
    let page = await this.getPageBySlug("visite-virtuelle")
    
    // Fallback: try "visiter" slug if "visite-virtuelle" not found
    if (!page) {
      console.warn("[v0] Page 'visite-virtuelle' not found, trying 'visiter'...")
      page = await this.getPageBySlug("visiter")
    }

    return page
  }

  async getMapPinPoints(pageData?: WPPage) {

    try {
      // Fetch the visite-virtuelle page to get map pin points from ACF
      const page = pageData || await this.getVisitePage()

      if (!page) {
        console.warn("[v0] No page found for map pin points (checked 'visite-virtuelle' and 'visiter')")
        return []
      }

      if (!page.acf?.map_pin_points || !Array.isArray(page.acf.map_pin_points)) {
        console.warn("[v0] Available ACF keys:", Object.keys(page.acf || {}))
        return []
      }

      // Log first point to see structure
      if (page.acf.map_pin_points.length > 0) {
        const first = page.acf.map_pin_points[0]
        console.warn("[v0] FIRST POINT KEYS:", Object.keys(first))
        console.warn("[v0] FIRST POINT MAP_PIN_POINT KEYS:", Object.keys(first?.map_pin_point || {}))
        console.warn("[v0] FIRST POINT raw image (map_pin_point.images):", first?.map_pin_point?.images)
      }

      const pinPoints = page.acf.map_pin_points
        .filter((point: any) => {
          // Try to find latitude/longitude in nested objects
          let latitude: any
          let longitude: any

          // Check various possible locations
          if (point.latitude !== undefined) {
            latitude = point.latitude
            longitude = point.longitude
          } else if (point.position?.latitude !== undefined) {
            latitude = point.position.latitude
            longitude = point.position.longitude
          } else if (point.mapPinPoint?.latitude !== undefined) {
            latitude = point.mapPinPoint.latitude
            longitude = point.mapPinPoint.longitude
          } else if (point.mapPinPoint?.position?.latitude !== undefined) {
            latitude = point.mapPinPoint.position.latitude
            longitude = point.mapPinPoint.position.longitude
          } else if (point.map_pin_point?.latitude !== undefined) {
            latitude = point.map_pin_point.latitude
            longitude = point.map_pin_point.longitude
          } else if (point.map_pin_point?.position?.latitude !== undefined) {
            latitude = point.map_pin_point.position.latitude
            longitude = point.map_pin_point.position.longitude
          } else if (point.coordonnees?.latitude !== undefined) {
            latitude = point.coordonnees.latitude
            longitude = point.coordonnees.longitude
          } else if (point.localisation?.latitude !== undefined) {
            latitude = point.localisation.latitude
            longitude = point.localisation.longitude
          }

          const hasPosition = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null

          if (!hasPosition) {
             console.warn("[v0] Skipping point without position:", point.title || point.nom || point.id)
          }

          return hasPosition
        })
        .map((point: any) => {
          // Find latitude/longitude
          let latitude = point.latitude || point.position?.latitude || point.mapPinPoint?.latitude || point.mapPinPoint?.position?.latitude || point.map_pin_point?.latitude || point.map_pin_point?.position?.latitude || point.coordonnees?.latitude || point.localisation?.latitude || 0
          let longitude = point.longitude || point.position?.longitude || point.mapPinPoint?.longitude || point.mapPinPoint?.position?.longitude || point.map_pin_point?.longitude || point.map_pin_point?.position?.longitude || point.coordonnees?.longitude || point.localisation?.longitude || 0
          let altitude = point.altitude || point.position?.altitude || point.mapPinPoint?.altitude || point.mapPinPoint?.position?.altitude || point.map_pin_point?.altitude || point.map_pin_point?.position?.altitude || point.coordonnees?.altitude || point.localisation?.altitude || 0


          const rawImage = point.map_pin_point?.images || point.map_pin_point?.image || null

          const toImg = (img: any): any => {
            if (!img) return null
            if (Array.isArray(img)) return toImg(img[0])
            if (typeof img === "string") return { url: img, alt: point.title || point.nom || "Image" }
            return {
              url: img.sizes?.thumbnail || img.url,
              alt: img.alt || point.title || point.nom || "Image",
            }
          }
          
          const processedImage = rawImage ? toImg(rawImage) : null
          // Wrap in array as expected by interface
          const imageArray = processedImage ? [processedImage] : null
          

          // Handle description
          const descriptif = point.descriptif || point.description || point.descriptive || point.map_pin_point?.descriptif || ""
          const shortDescription = descriptif
            ? descriptif.replace(/<[^>]*>/g, "").substring(0, 100)
            : undefined

          return {
            id: point.id || Math.random(),
            type: point.type || "point",
            title: point.title || point.nom || "Sans titre",
            slug: point.slug || "",
            link: point.link || point.url || "",
            mapPinPoint: {
              visibilite: true,
              nom: point.nom || point.title || "",
              image: imageArray,
              descriptif: shortDescription,
              lien: point.lien || point.link || point.url,
              position: {
                latitude,
                longitude,
                altitude,
              },
            },
          }
        })

      return pinPoints
    } catch (error) {
      console.error("[v0] ERROR fetching map pin points:", error)
      return []
    }
  }

  async getHomepage(): Promise<WPPage> {
    return this.getPageById(138) // Homepage ID from ACF export
  }

  async getGlobalOptions(): Promise<GlobalOptionsACF> {
    console.warn("[v0] WordPress API - getGlobalOptions() called")

    try {
      const data = await this.fetch<any>("/options-globales", {
        acf_format: "standard",
      })

      const optimizeImageData = (img: any) => {
        if (!img) return img
        return {
          url: img.sizes?.thumbnail || img.url,
          alt: img.alt || "",
          width: img.sizes?.["thumbnail-width"] || img.width,
          height: img.sizes?.["thumbnail-height"] || img.height,
        }
      }

      return {
        lien_du_cta_de_barre_superieure: data.menu?.lien_du_cta_de_barre_superieure || {
          title: "Réserver",
          url: "/contact",
          target: "",
        },
        miniature_du_megamenu: {
          titre_cta_1: data.menu?.miniature_du_megamenu?.titre_cta_1 || "Découvrir le lieu",
          lien_cta_1: data.menu?.miniature_du_megamenu?.lien_cta_1 || {
            title: "Découvrir le lieu",
            url: "/visite-virtuelle",
            target: "",
          },
          titre_cta_2: data.menu?.miniature_du_megamenu?.titre_cta_2,
          lien_cta_2: data.menu?.miniature_du_megamenu?.lien_cta_2,
          image: optimizeImageData(data.menu?.miniature_du_megamenu?.image),
        },
      }
    } catch (error) {
      console.error("[v0] ERROR fetching global options:", error instanceof Error ? error.message : error)

      return {
        lien_du_cta_de_barre_superieure: {
          title: "Réserver",
          url: "/contact",
          target: "",
        },
        miniature_du_megamenu: {
          titre_cta_1: "Découvrir le lieu",
          lien_cta_1: {
            title: "Découvrir le lieu",
            url: "/visite-virtuelle",
            target: "",
          },
          image: {
            url: "/rural-retreat-hermitage-building-nature.jpg",
            alt: "Vue de l'Hermitage",
          },
        },
      }
    }
  }

  async getMenu(menuSlug = "menu-1"): Promise<WPMenuItem[]> {
    console.warn(`[v0] Fetching WordPress menu: ${menuSlug}`)

    try {
      // Try custom endpoint first
      const customUrl = `${this.wpJsonBase}/custom/v1/menu/${menuSlug}`
      console.warn(`[v0] Trying custom menu endpoint: ${customUrl}`)

      const response = await fetch(customUrl, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      })

      if (response.ok) {
        const data = await response.json()
        console.warn(`[v0] Successfully fetched menu from custom endpoint`)
        console.warn(`[v0] Menu data:`, JSON.stringify(data, null, 2))
        return decodeObjectEntities(data)
      } else {
        console.error(`[v0] Custom menu endpoint failed with status: ${response.status}`)
      }
    } catch (error) {
      console.error(`[v0] Error fetching menu:`, error)
    }

    // Return empty array as fallback
    console.warn(`[v0] Returning empty menu array`)
    return []
  }

  async getTaxonomyTerms(taxonomy: string): Promise<WPTerm[]> {
    console.warn(`[v0] Fetching terms for taxonomy: ${taxonomy}`)
    return this.fetch<WPTerm>(`/${taxonomy}`, {
      per_page: 100,
      hide_empty: true,
    })
  }

  async getTeamMembers() {
    console.warn("[v0] WordPress API - getTeamMembers() called")
    try {
      const membres = await this.getPosts<TeamMemberACF>("membre", {
        per_page: 100,
        orderby: "date",
        order: "asc", // Changed order from "desc" to "asc"
      })
      console.warn("[v0] WordPress API - getTeamMembers() returned:", membres.length, "membres")
      return membres
    } catch (error) {
      console.error("[v0] Error fetching team members:", error)
      return []
    }
  }
}

export const wpApi = new WordPressAPI()

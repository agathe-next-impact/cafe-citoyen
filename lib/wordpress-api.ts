export interface WordPressPage {
  id: number
  title: {
    rendered: string
  }
  link: string
  slug: string
  parent: number
  menu_order: number
  content?: {
    rendered: string
  }
  acf?: {
    "sous-titre"?: string
    background?: {
      url: string
      alt: string
      title: string
    }
    contenu?: string
    images?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }>
    galerie?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }>
    hero_gallery?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }>
    video?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }> | string
    encadres?: Array<{
      titre?: string;
      texte?: string;
      illustration?: {
        url: string;
        alt: string;
        title: string;
        ID: number;
        height: number;
        width: number;
      };
    }>;
    video_de_lequipe?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }> | string
  }
}

export interface WordPressEvent {
  id: number
  title: {
    rendered: string
  }
  date: string
  link: string
  slug: string
  excerpt: {
    rendered: string
  }
  acf?: {
    "sous-titre"?: string
    background?: {
      url: string
      alt: string
      title: string
    }
    page_daffichage?: string | Array<{ url: string } | string>
    descriptif?: string
    images?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }>
    partenaires_associes?: string[]
    partenaires_details?: Array<{
      id: number
      title: string
      link: string
    }>
    recurrent_ou_ponctuel?: boolean
    date_de_debut?: string
    date_de_fin?: string
    heure_de_debut?: string
    heure_de_fin?: string
    jour?: string
    heure?: string
    duree_en_heures?: number
    debut_de_periode?: string
    fin_de_periode?: string
  }
  featured_media?: number
  "saison-culturelle"?: number[]
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
}

export interface WordPressPost {
  id: number
  title: {
    rendered: string
  }
  date: string
  link: string
  slug: string
  excerpt: {
    rendered: string
  }
  content: {
    rendered: string
  }
  featured_media?: number
  categories?: number[]
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
  acf?: {
    "sous-titre"?: string
    background?: {
      url: string
      alt: string
      title: string
    }
  }
}

export interface TeamMember {
  id: number
  title: {
    rendered: string
  }
  link: string
  slug: string
  featured_media?: number
  acf?: {
    role?: string
    mini_bio?: string
    liens?: Array<{
      lien: {
        url: string
        title: string
        target: string
      }
    }>
  }
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
  }
}

export interface Partner {
  id: number
  title: {
    rendered: string
  }
  link: string
  slug: string
  featured_media?: number
  acf?: {
    descriptif?: string
    lien_vers_le_site?: {
      url: string
      title: string
      target: string
    }
    images?: Array<{
      url: string
      alt: string
      title: string
      ID: number
    }>
  }
  "type-de-partenaire"?: number[]
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
        taxonomy: string
      }>
    >
  }
}

export interface SiteOptions {
  titre_du_site?: string
  description_du_site?: string
  logo_du_site?: {
    url: string
    alt: string
    title: string
    ID: number
  }
  reseaux_sociaux?: Array<{
    icone?:
      | {
          url: string
          alt: string
          title: string
          ID: number
        }
      | Array<{
          url: string
          alt: string
          title: string
          ID: number
        }>
    lien?: string
  }>
}

const WORDPRESS_URL = "https://wordpress-starter.fr"

function decodeHtmlEntities(text: string): string {
  // Create a temporary element to decode HTML entities
  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea")
    textarea.innerHTML = text
    return textarea.value
  }

  // Server-side decoding for common entities
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


function measureTime(label: string) {
  const start = Date.now()
  return () => {
    const duration = Date.now() - start
  }
}

export async function getWordPressPages(): Promise<WordPressPage[]> {
  const endMeasure = measureTime("getWordPressPages")


  try {
    const fetchStart = Date.now()
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/pages?per_page=100&_fields=id,title,link,parent,slug,menu_order`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    )

    if (!response.ok) {
      endMeasure()
      return []
    }

    const pages = await response.json()
    endMeasure()
    return pages
  } catch (error) {
    console.error("[v0] Error fetching WordPress pages:", error)
    endMeasure()
    return []
  }
}

async function fetchPartnerByUrl(url: string): Promise<{ id: number; title: string; link: string } | null> {
  try {
    // Extract slug from URL
    const urlParts = url.split("/")
    const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1]

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/partenaire?slug=${slug}&_fields=id,title,link`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return null
    }

    const partners = await response.json()
    if (partners.length > 0) {
      return {
        id: partners[0].id,
        title: decodeHtmlEntities(partners[0].title.rendered),
        link: partners[0].link,
      }
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching partner:", error)
    return null
  }
}

export async function getWordPressEvents(): Promise<WordPressEvent[]> {
  const endMeasure = measureTime("getWordPressEvents")


  try {
    const fetchStart = Date.now()
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/evenement?per_page=100&_embed&acf_format=standard`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      endMeasure()
      return []
    }

    const text = await response.text()
    let events
    try {
      events = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] Error parsing events JSON:", parseError)
      endMeasure()
      return []
    }

    const partnerStart = Date.now()
    const eventsWithPartners = await Promise.all(
      events.map(async (event: WordPressEvent) => {
        if (event.acf?.partenaires_associes && event.acf.partenaires_associes.length > 0) {
          const partnersDetails = await Promise.all(
            event.acf.partenaires_associes.map((url: string) => fetchPartnerByUrl(url)),
          )
          event.acf.partenaires_details = partnersDetails.filter((p) => p !== null) as Array<{
            id: number
            title: string
            link: string
          }>
        }
        return event
      }),
    )

    endMeasure()
    return eventsWithPartners
  } catch (error) {
    console.error("[v0] Error fetching WordPress events:", error)
    endMeasure()
    return []
  }
}

export async function getWordPressEventBySlug(slug: string): Promise<WordPressEvent | null> {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/evenement?slug=${slug}&_embed&acf_format=standard`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return null
    }

    const events = await response.json()
    if (events.length > 0) {
      const event = events[0]

      // Fetch partner details if available
      if (event.acf?.partenaires_associes && event.acf.partenaires_associes.length > 0) {
        const partnersDetails = await Promise.all(
          event.acf.partenaires_associes.map((url: string) => fetchPartnerByUrl(url)),
        )
        event.acf.partenaires_details = partnersDetails.filter((p) => p !== null) as Array<{
          id: number
          title: string
          link: string
        }>
      }

      return event
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching WordPress event:", error)
    return null
  }
}

export async function getAllEventSlugs(): Promise<string[]> {
  try {
    const events = await getWordPressEvents()
    return events.map((event) => event.slug)
  } catch (error) {
    console.error("[v0] Error fetching event slugs:", error)
    return []
  }
}

export async function getWordPressPageBySlug(slug: string, options: { status?: string } = {}): Promise<WordPressPage | null> {
  try {
    const status = options.status ? `&status=${options.status}` : ''
    const previewSecret = process.env.NEXT_PUBLIC_PREVIEW_SECRET;
    const secretParam = options.status === "any" && previewSecret ? `&secret=${encodeURIComponent(previewSecret)}` : "";
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${slug}${status}${secretParam}&_fields=id,title,content,link,slug,parent,acf&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    )

    if (!response.ok) {
      return null
    }

    const pages = await response.json()
    if (pages.length > 0) {
      return pages[0]
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching WordPress page:", error)
    return null
  }
}

export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const pages = await getWordPressPages()
    return pages.map((page) => page.slug)
  } catch (error) {
    console.error("[v0] Error fetching page slugs:", error)
    return []
  }
}

export function organizePagesByParent(
  pages: WordPressPage[],
): { parent: string; parentSlug: string; parentHref: string; pages: { title: string; href: string }[] }[] {
  // Find all parent pages (pages with no parent)
  const parentPages = pages.filter((page) => page.parent === 0)

  // Sort parent pages by menu order
  parentPages.sort((a, b) => a.menu_order - b.menu_order)

  // Organize child pages under their parents
  const menuItems = parentPages.map((parent) => {
    const parentTitle = decodeHtmlEntities(parent.title.rendered)

    let childPages = pages
      .filter((page) => page.parent === parent.id)
      .sort((a, b) => a.menu_order - b.menu_order)
      .map((page) => ({
        title: decodeHtmlEntities(page.title.rendered),
        href: `/${page.slug}`,
      }))

    let cardTitle = parentTitle

    if (childPages.length > 0) {
      const firstPageTitle = childPages[0].title
      const firstPageTitleLower = firstPageTitle.toLowerCase()
      const parentTitleLower = parentTitle.toLowerCase()

      // Check if first page is a "Voir..." link
      if (
        firstPageTitleLower.startsWith("voir") &&
        (firstPageTitleLower.includes(parentTitleLower) || firstPageTitleLower === `voir ${parentTitleLower}`)
      ) {
        cardTitle = firstPageTitle // Use the "Voir..." text as card title
        childPages = childPages.slice(1) // Remove it from the list
      }
    }

    return {
      parent: cardTitle,
      parentSlug: parent.slug,
      parentHref: `/${parent.slug}`,
      pages: childPages,
    }
  })

  return menuItems.filter((item) => item.pages.length > 0)
}

export async function getEventsByPageUrl(pageUrl: string): Promise<WordPressEvent[]> {
  try {
    const allEvents = await getWordPressEvents()

    const pageEvents = allEvents.filter((event) => {
      if (!event.acf?.page_daffichage) return false

      const pageDisplay = event.acf.page_daffichage

      // Handle if it's an array
      if (Array.isArray(pageDisplay)) {
        return pageDisplay.some((url) => {
          if (typeof url === "string") {
            const eventPageUrl = url.replace(/\/$/, "")
            const normalizedPageUrl = pageUrl.replace(/\/$/, "")
            return eventPageUrl === normalizedPageUrl
          } else if (typeof url === "object" && url !== null && "url" in url) {
            const eventPageUrl = (url as any).url.replace(/\/$/, "")
            const normalizedPageUrl = pageUrl.replace(/\/$/, "")
            return eventPageUrl === normalizedPageUrl
          }
          return false
        })
      }

      // Handle if it's an object with a url property
      if (typeof pageDisplay === "object" && pageDisplay !== null && "url" in pageDisplay) {
        const eventPageUrl = (pageDisplay as any).url.replace(/\/$/, "")
        const normalizedPageUrl = pageUrl.replace(/\/$/, "")
        return eventPageUrl === normalizedPageUrl
      }

      // Handle if it's a string
      if (typeof pageDisplay === "string") {
        const eventPageUrl = pageDisplay.replace(/\/$/, "")
        const normalizedPageUrl = pageUrl.replace(/\/$/, "")
        return eventPageUrl === normalizedPageUrl
      }

      return false
    })

    return pageEvents
  } catch (error) {
    console.error("[v0] Error fetching events by page URL:", error)
    return []
  }
}

export async function getEventsByPageSlug(slug: string): Promise<WordPressEvent[]> {
  try {
    const page = await getWordPressPageBySlug(slug)
    if (!page) return []

    return await getEventsByPageUrl(page.link)
  } catch (error) {
    console.error("[v0] Error fetching events by page slug:", error)
    return []
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {

  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/membre?per_page=100&_embed&acf_format=standard`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return []
    }

    const members = await response.json()
    return members
  } catch (error) {
    console.error("[v0] Error fetching team members:", error)
    return []
  }
}

export async function getWordPressPosts(): Promise<WordPressPost[]> {

  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=100&_embed&acf_format=standard`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return []
    }

    const posts = await response.json()
    return posts
  } catch (error) {
    console.error("[v0] Error fetching WordPress posts:", error)
    return []
  }
}

export async function getPartners(): Promise<Partner[]> {

  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/partenaire?per_page=100&_embed&acf_format=standard`, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return []
    }

    const partners = await response.json()
    return partners
  } catch (error) {
    console.error("[v0] Error fetching partners:", error)
  }

  const defaultOptions: Partner[] = []
  return defaultOptions
}

export async function getSiteOptions(): Promise<SiteOptions | null> {
  const endMeasure = measureTime("getSiteOptions")

  try {
    const url = `${WORDPRESS_URL}/wp-json/site/v1/reglages`

    const fetchInit: RequestInit & { next?: { revalidate: number } } = {
      headers: {
        "Accept-Charset": "utf-8",
      },
      cache: 'no-store', // Désactiver le cache pour le debug
    }

    // Only use Next.js revalidate option on the server
    if (typeof window === "undefined") {
      fetchInit.next = { revalidate: 0 } // Désactiver la revalidation pour le debug
    }

    console.log('[getSiteOptions] Appel API vers:', url)
    const response = await fetch(url, fetchInit)

    if (response.ok) {
      const result = await response.json()
      console.log('[getSiteOptions] Réponse brute:', result)

      const data = result.data || result
      console.log('[getSiteOptions] Data extraite:', data)
      console.log('[getSiteOptions] Réseaux sociaux bruts:', data.reseaux_sociaux)

      const siteOptions: SiteOptions = {
        titre_du_site: data.titre_du_site || "Café Citoyen",
        description_du_site: data.description_du_site || "Centre de rencontres citoyennes",
        logo_du_site: data.logo_du_site,
        reseaux_sociaux: data.reseaux_sociaux || [],
      }

      console.log('[getSiteOptions] Options finales:', siteOptions)
      endMeasure()
      return siteOptions
    } else {
      const errorText = await response.text()
      console.error('[getSiteOptions] Erreur HTTP:', response.status, errorText)
    }
  } catch (error) {
    console.error("[v0] Error fetching site options:", error)
  }

  const defaultOptions: SiteOptions = {
    titre_du_site: "Café citoyen",
    description_du_site: "Centre culturel de rencontre",
    logo_du_site: undefined,
    reseaux_sociaux: [],
  }
  endMeasure()
  return defaultOptions
}



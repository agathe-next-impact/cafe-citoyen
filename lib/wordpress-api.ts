import { env } from "process";
import { cache } from "react";
import { decodeHtmlEntities } from "./decode";

export interface YoastHeadJson {
  title: string;
  description?: string;
  robots?: {
    index: string;
    follow: string;
    "max-snippet"?: string;
    "max-image-preview"?: string;
    "max-video-preview"?: string;
  };
  canonical?: string;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  article_publisher?: string;
  article_published_time?: string;
  article_modified_time?: string;
  og_image?: Array<{
    width: number;
    height: number;
    url: string;
    type: string;
  }>;
  twitter_card?: string;
  twitter_site?: string;
  twitter_creator?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string[];
  schema?: {
    "@context": string;
    "@graph": any[];
  };
}

export interface WordPressPage {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  slug: string;
  parent: number;
  menu_order: number;
  yoast_head_json?: YoastHeadJson;
  content?: {
    rendered: string;
  };
  acf?: {
    "sous-titre"?: string;
    background?: {
      url: string;
      alt: string;
      title: string;
    };
    contenu?: string;
    images?: Array<{
      url: string;
      alt: string;
      title: string;
      ID: number;
    }>;
    galerie?: Array<{
      url: string;
      alt: string;
      title: string;
      ID: number;
    }>;
    hero_gallery?: Array<{
      url: string;
      alt: string;
      title: string;
      ID: number;
    }>;
    video?:
      | Array<{
          url: string;
          alt: string;
          title: string;
          ID: number;
        }>
      | string;
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
    video_de_lequipe?:
      | Array<{
          url: string;
          alt: string;
          title: string;
          ID: number;
        }>
      | string;
    section_video?: {
      video?: string | null;
      lien?: string;
      texte_du_lien?: string;
    };
    liens_du_menu_du_hero?: Array<{
      lien: {
        texte_du_lien: string;
        page: Array<{
          ID: number;
          post_title: string;
          post_name: string;
        }>;
      };
    }>;
    docs_a_presenter?: Array<{
      document: {
        titre_du_document?: string;
        fichier?: {
          url: string;
          title: string;
          filename: string;
          subtype?: string;
        };
      };
    }>;
  };
}

export interface WordPressEvent {
  id: number;
  title: {
    rendered: string;
  };
  date: string;
  link: string;
  slug: string;
  yoast_head_json?: YoastHeadJson;
  excerpt: {
    rendered: string;
  };
  acf?: {
    "sous-titre"?: string;
    background?: {
      url: string;
      alt: string;
      title: string;
    };
    page_daffichage?: string | Array<{ url: string } | string>;
    descriptif?: string;
    images?: Array<{
      url: string;
      alt: string;
      title: string;
      ID: number;
    }>;
    partenaires_associes?: string[];
    partenaires_details?: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    recurrent_ou_ponctuel?: boolean;
    date_de_debut?: string;
    date_de_fin?: string;
    heure_de_debut?: string;
    heure_de_fin?: string;
    jour?: string;
    heure?: string;
    duree_en_heures?: number;
    debut_de_periode?: string;
    fin_de_periode?: string;
  };
  featured_media?: number;
  "saison-culturelle"?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  date: string;
  link: string;
  slug: string;
  yoast_head_json?: YoastHeadJson;
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media?: number;
  categories?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
  acf?: {
    "sous-titre"?: string;
    background?: {
      url: string;
      alt: string;
      title: string;
    };
  };
}

export interface TeamMember {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  slug: string;
  featured_media?: number;
  acf?: {
    role?: string;
    mini_bio?: string;
    liens?: Array<{
      lien: {
        url: string;
        title: string;
        target: string;
      };
    }>;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface Partner {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  slug: string;
  featured_media?: number;
  acf?: {
    descriptif?: string;
    lien_vers_le_site?: {
      url: string;
      title: string;
      target: string;
    };
    images?: Array<{
      url: string;
      alt: string;
      title: string;
      ID: number;
    }>;
  };
  "type-de-partenaire"?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface SiteOptions {
  adresse_mail?: string;
  titre_du_site?: string;
  description_du_site?: string;
  logo_du_site?: {
    url: string;
    alt: string;
    title: string;
    ID: number;
  };
  reseaux_sociaux?: Array<{
    icone?:
      | {
          url: string;
          alt: string;
          title: string;
          ID: number;
        }
      | Array<{
          url: string;
          alt: string;
          title: string;
          ID: number;
        }>;
    lien?: string;
  }>;
}

const WORDPRESS_URL = env.WORDPRESS_URL || "https://wp-back.cafecitoyen.art";

function measureTime(label: string) {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
  };
}

export const getWordPressPages = cache(async function getWordPressPages(): Promise<WordPressPage[]> {
  const endMeasure = measureTime("getWordPressPages");

  try {
    const fetchStart = Date.now();
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/pages?per_page=100&_fields=id,title,link,parent,slug,menu_order`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      endMeasure();
      return [];
    }

    const pages = await response.json();
    endMeasure();
    return pages;
  } catch (error) {
    console.error("[v0] Error fetching WordPress pages:", error);
    endMeasure();
    return [];
  }
});

function extractSlugFromUrl(url: string): string {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
}

async function fetchPartnersByUrls(
  urls: string[],
): Promise<Map<string, { id: number; title: string; link: string }>> {
  const partnerMap = new Map<string, { id: number; title: string; link: string }>();
  if (urls.length === 0) return partnerMap;

  // Deduplicate slugs
  const slugToUrls = new Map<string, string[]>();
  for (const url of urls) {
    const slug = extractSlugFromUrl(url);
    if (!slugToUrls.has(slug)) {
      slugToUrls.set(slug, []);
    }
    slugToUrls.get(slug)!.push(url);
  }

  const uniqueSlugs = Array.from(slugToUrls.keys());

  // Batch fetch all partners in one request (comma-separated slugs)
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/partenaire?slug=${uniqueSlugs.join(",")}&_fields=id,title,link,slug&per_page=100`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return partnerMap;

    const partners = await response.json();
    for (const partner of partners) {
      const partnerData = {
        id: partner.id,
        title: decodeHtmlEntities(partner.title.rendered),
        link: partner.link,
      };
      // Map back to original URLs
      const matchingUrls = slugToUrls.get(partner.slug) || [];
      for (const url of matchingUrls) {
        partnerMap.set(url, partnerData);
      }
    }
  } catch (error) {
    console.error("[v0] Error batch fetching partners:", error);
  }

  return partnerMap;
}

export const getWordPressEvents = cache(async function getWordPressEvents(): Promise<WordPressEvent[]> {
  const endMeasure = measureTime("getWordPressEvents");

  try {
    const fetchStart = Date.now();
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/evenement?per_page=100&_embed&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      endMeasure();
      return [];
    }

    const text = await response.text();
    let events;
    try {
      events = JSON.parse(text);
    } catch (parseError) {
      console.error("[v0] Error parsing events JSON:", parseError);
      endMeasure();
      return [];
    }

    // Collect all unique partner URLs across all events
    const allPartnerUrls: string[] = [];
    for (const event of events) {
      if (event.acf?.partenaires_associes?.length > 0) {
        allPartnerUrls.push(...event.acf.partenaires_associes);
      }
    }

    // Single batch fetch for all partners
    const partnerMap = await fetchPartnersByUrls(allPartnerUrls);

    // Distribute partner details to each event
    for (const event of events) {
      if (event.acf?.partenaires_associes?.length > 0) {
        event.acf.partenaires_details = event.acf.partenaires_associes
          .map((url: string) => partnerMap.get(url))
          .filter((p: { id: number; title: string; link: string } | undefined): p is { id: number; title: string; link: string } => p != null);
      }
    }

    endMeasure();
    return events;
  } catch (error) {
    console.error("[v0] Error fetching WordPress events:", error);
    endMeasure();
    return [];
  }
});

export const getUpcomingEvents = cache(async function getUpcomingEvents(
  limit: number = 6,
): Promise<WordPressEvent[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/evenement?per_page=100&_embed&_fields=id,title,slug,date,acf,_embedded,_links&acf_format=standard`,
      {
        headers: { "Accept-Charset": "utf-8" },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return [];

    const events: WordPressEvent[] = await response.json();
    const now = new Date();

    return events
      .filter((e) => {
        if (!e.acf?.date_de_debut) return false;
        const parts = e.acf.date_de_debut.split("/");
        if (parts.length !== 3) return false;
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day) >= now;
      })
      .sort((a, b) => {
        const aParts = a.acf?.date_de_debut?.split("/").map(Number) || [0, 0, 0];
        const bParts = b.acf?.date_de_debut?.split("/").map(Number) || [0, 0, 0];
        return new Date(aParts[2], aParts[1] - 1, aParts[0]).getTime() -
               new Date(bParts[2], bParts[1] - 1, bParts[0]).getTime();
      })
      .slice(0, limit);
  } catch (error) {
    console.error("[v0] Error fetching upcoming events:", error);
    return [];
  }
});

export const getWordPressEventBySlug = cache(async function getWordPressEventBySlug(
  slug: string,
): Promise<WordPressEvent | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/evenement?slug=${slug}&_embed&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const events = await response.json();
    if (events.length > 0) {
      const event = events[0];

      // Fetch partner details if available
      if (
        event.acf?.partenaires_associes &&
        event.acf.partenaires_associes.length > 0
      ) {
        const partnerMap = await fetchPartnersByUrls(event.acf.partenaires_associes);
        event.acf.partenaires_details = event.acf.partenaires_associes
          .map((url: string) => partnerMap.get(url))
          .filter((p: { id: number; title: string; link: string } | undefined): p is { id: number; title: string; link: string } => p != null);
      }

      return event;
    }
    return null;
  } catch (error) {
    console.error("[v0] Error fetching WordPress event:", error);
    return null;
  }
});

export async function getAllEventSlugs(): Promise<string[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/evenement?per_page=100&_fields=slug`,
      {
        headers: { "Accept-Charset": "utf-8" },
        next: { revalidate: 60 },
      },
    );
    if (!response.ok) return [];
    const events = await response.json();
    return events.map((event: { slug: string }) => event.slug);
  } catch (error) {
    console.error("[v0] Error fetching event slugs:", error);
    return [];
  }
}

export const getWordPressPageBySlug = cache(async function getWordPressPageBySlug(
  slug: string,
  options: { status?: string } = {},
): Promise<WordPressPage | null> {
  try {
    const status = options.status ? `&status=${options.status}` : "";
    const previewSecret = process.env.NEXT_PUBLIC_PREVIEW_SECRET;
    const secretParam =
      options.status === "any" && previewSecret
        ? `&secret=${encodeURIComponent(previewSecret)}`
        : "";
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${slug}${status}${secretParam}&_fields=id,title,content,link,slug,parent,acf,yoast_head_json&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const pages = await response.json();
    if (pages.length > 0) {
      return pages[0];
    }
    return null;
  } catch (error) {
    console.error("[v0] Error fetching WordPress page:", error);
    return null;
  }
});

export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const allSlugs: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/pages?per_page=100&page=${page}&_fields=slug`,
        {
          headers: { "Accept-Charset": "utf-8" },
          next: { revalidate: 60 },
        },
      );
      if (!response.ok) break;
      const pages = await response.json();
      if (pages.length === 0) break;
      allSlugs.push(...pages.map((p: { slug: string }) => p.slug));
      const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "1", 10);
      hasMore = page < totalPages;
      page++;
    }

    return allSlugs;
  } catch (error) {
    console.error("[v0] Error fetching page slugs:", error);
    return [];
  }
}

export function organizePagesByParent(
  pages: WordPressPage[],
): {
  parent: string;
  parentSlug: string;
  parentHref: string;
  pages: { title: string; href: string }[];
}[] {
  // Find all parent pages (pages with no parent)
  const parentPages = pages.filter((page) => page.parent === 0);

  // Sort parent pages by menu order
  parentPages.sort((a, b) => a.menu_order - b.menu_order);

  // Organize child pages under their parents
  const menuItems = parentPages.map((parent) => {
    const parentTitle = decodeHtmlEntities(parent.title.rendered);

    let childPages = pages
      .filter((page) => page.parent === parent.id)
      .sort((a, b) => a.menu_order - b.menu_order)
      .map((page) => ({
        title: decodeHtmlEntities(page.title.rendered),
        href: `/${page.slug}`,
      }));

    let cardTitle = parentTitle;

    if (childPages.length > 0) {
      const firstPageTitle = childPages[0].title;
      const firstPageTitleLower = firstPageTitle.toLowerCase();
      const parentTitleLower = parentTitle.toLowerCase();

      // Check if first page is a "Voir..." link
      if (
        firstPageTitleLower.startsWith("voir") &&
        (firstPageTitleLower.includes(parentTitleLower) ||
          firstPageTitleLower === `voir ${parentTitleLower}`)
      ) {
        cardTitle = firstPageTitle; // Use the "Voir..." text as card title
        childPages = childPages.slice(1); // Remove it from the list
      }
    }

    return {
      parent: cardTitle,
      parentSlug: parent.slug,
      parentHref: `/${parent.slug}`,
      pages: childPages,
    };
  });

  return menuItems.filter((item) => item.pages.length > 0);
}

export async function getEventsByPageUrl(
  pageUrl: string,
): Promise<WordPressEvent[]> {
  try {
    const allEvents = await getWordPressEvents();

    const pageEvents = allEvents.filter((event) => {
      if (!event.acf?.page_daffichage) return false;

      const pageDisplay = event.acf.page_daffichage;

      // Handle if it's an array
      if (Array.isArray(pageDisplay)) {
        return pageDisplay.some((url) => {
          if (typeof url === "string") {
            const eventPageUrl = url.replace(/\/$/, "");
            const normalizedPageUrl = pageUrl.replace(/\/$/, "");
            return eventPageUrl === normalizedPageUrl;
          } else if (typeof url === "object" && url !== null && "url" in url) {
            const eventPageUrl = (url as any).url.replace(/\/$/, "");
            const normalizedPageUrl = pageUrl.replace(/\/$/, "");
            return eventPageUrl === normalizedPageUrl;
          }
          return false;
        });
      }

      // Handle if it's an object with a url property
      if (
        typeof pageDisplay === "object" &&
        pageDisplay !== null &&
        "url" in pageDisplay
      ) {
        const eventPageUrl = (pageDisplay as any).url.replace(/\/$/, "");
        const normalizedPageUrl = pageUrl.replace(/\/$/, "");
        return eventPageUrl === normalizedPageUrl;
      }

      // Handle if it's a string
      if (typeof pageDisplay === "string") {
        const eventPageUrl = pageDisplay.replace(/\/$/, "");
        const normalizedPageUrl = pageUrl.replace(/\/$/, "");
        return eventPageUrl === normalizedPageUrl;
      }

      return false;
    });

    return pageEvents;
  } catch (error) {
    console.error("[v0] Error fetching events by page URL:", error);
    return [];
  }
}

export async function getEventsByPageSlug(
  slug: string,
): Promise<WordPressEvent[]> {
  try {
    const page = await getWordPressPageBySlug(slug);
    if (!page) return [];

    return await getEventsByPageUrl(page.link);
  } catch (error) {
    console.error("[v0] Error fetching events by page slug:", error);
    return [];
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/membre?per_page=100&_embed&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const members = await response.json();
    return members;
  } catch (error) {
    console.error("[v0] Error fetching team members:", error);
    return [];
  }
}

export const getWordPressPosts = cache(async function getWordPressPosts(): Promise<WordPressPost[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=100&_embed&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error("[v0] Error fetching WordPress posts:", error);
    return [];
  }
});

export async function getPartners(): Promise<Partner[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wp/v2/partenaire?per_page=100&_embed&acf_format=standard`,
      {
        headers: {
          "Accept-Charset": "utf-8",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const partners = await response.json();
    return partners;
  } catch (error) {
    console.error("[v0] Error fetching partners:", error);
  }

  const defaultOptions: Partner[] = [];
  return defaultOptions;
}

export const getSiteOptions = cache(async function getSiteOptions(): Promise<SiteOptions | null> {
  const endMeasure = measureTime("getSiteOptions");

  try {
    const url = `${WORDPRESS_URL}/wp-json/site/v1/reglages`;

    const response = await fetch(url, {
      headers: {
        "Accept-Charset": "utf-8",
      },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const result = await response.json();
      const data = result.data || result;

      const siteOptions: SiteOptions = {
        adresse_mail: data.adresse_mail,
        titre_du_site: data.titre_du_site || "Café Citoyen",
        description_du_site:
          data.description_du_site || "Centre de rencontres citoyennes",
        logo_du_site: data.logo_du_site,
        reseaux_sociaux: data.reseaux_sociaux || [],
      };

      endMeasure();
      return siteOptions;
    } else {
      const errorText = await response.text();
      console.error(
        "[getSiteOptions] Erreur HTTP:",
        response.status,
        errorText,
      );
    }
  } catch (error) {
    console.error("[v0] Error fetching site options:", error);
  }

  const defaultOptions: SiteOptions = {
    adresse_mail: "cafecitoyenauger@gmail.com",
    titre_du_site: "Café citoyen",
    description_du_site: "Centre culturel de rencontre",
    logo_du_site: undefined,
    reseaux_sociaux: [],
  };
  endMeasure();
  return defaultOptions;
});

/**
 * WordPress API utilities for headless preview
 */

export interface WPPreviewParams {
  id: string | number;
  postType?: string;
  token?: string;
  secret?: string;
}

export interface WPPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  status: string;
  type: string;
  featured_media: number;
  author: number;
  categories?: number[];
  tags?: number[];
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
      avatar_urls: Record<string, string>;
    }>;
  };
}

export interface WPPreviewData {
  post: WPPost | null;
  isPreview: boolean;
  postType: string;
}

const WP_API_URL =
  process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const WP_PREVIEW_SECRET = process.env.WP_PREVIEW_SECRET;

/**
 * Cache for post type mappings
 */
let postTypeMappings: Record<string, string> | null = null;

/**
 * Fetch post type REST base mappings from WordPress
 */
async function fetchPostTypeMappings(): Promise<Record<string, string>> {
  if (postTypeMappings) {
    return postTypeMappings;
  }

  try {
    const response = await fetch(
      `${WP_API_URL?.replace("/wp-json", "")}/wp-json/headless-preview/v1/post-types`,
      {
        cache: "force-cache",
      },
    );

    if (response.ok) {
      const data = await response.json();
      postTypeMappings = {};
      for (const [postType, info] of Object.entries(
        data as Record<string, { rest_base: string }>,
      )) {
        postTypeMappings[postType] = info.rest_base;
      }
      return postTypeMappings;
    }
  } catch (error) {
    console.warn("Could not fetch post type mappings:", error);
  }

  return {};
}

/**
 * Get the WordPress REST API endpoint for a given post type
 * WordPress REST API uses plural forms for endpoints by default
 */
export function getPostTypeEndpoint(postType: string): string {
  const endpoints: Record<string, string> = {
    post: "posts",
    page: "pages",
    // Add your custom post types here if they have non-standard endpoints
    // 'my-cpt': 'my-cpts',
  };

  // If we have a mapped endpoint, use it
  if (endpoints[postType]) {
    return endpoints[postType];
  }

  // For CPTs, WordPress typically uses the post type name as-is for the REST endpoint
  // but some plugins/themes register them with custom rest_base
  // Common pattern: singular -> plural (add 's')
  return postType;
}

/**
 * Get the WordPress REST API endpoint for a given post type (async version)
 * This fetches the actual rest_base from WordPress for ACF and other plugin CPTs
 */
export async function getPostTypeEndpointAsync(
  postType: string,
): Promise<string> {
  // Check built-in types first
  const builtIn: Record<string, string> = {
    post: "posts",
    page: "pages",
  };

  if (builtIn[postType]) {
    return builtIn[postType];
  }

  // Fetch mappings from WordPress for CPTs
  const mappings = await fetchPostTypeMappings();
  if (mappings[postType]) {
    return mappings[postType];
  }

  // Fallback to post type name
  return postType;
}

/**
 * Fetch a preview post from WordPress using authentication
 */
export async function fetchPreviewPost({
  id,
  postType = "post",
  token,
}: WPPreviewParams): Promise<WPPost | null> {
  if (!WP_API_URL) {
    console.error("WordPress API URL is not configured");
    return null;
  }

  // Use async version to get correct endpoint for ACF CPTs
  const endpoint = await getPostTypeEndpointAsync(postType);
  const url = `${WP_API_URL}/wp/v2/${endpoint}/${id}?_embed&status=any`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add authorization header if token is provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store", // Always fetch fresh data for previews
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch preview: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const post: WPPost = await response.json();
    return post;
  } catch (error) {
    console.error("Error fetching preview post:", error);
    return null;
  }
}

/**
 * Fetch a draft or revision post from WordPress
 */
export async function fetchDraftPost({
  id,
  postType = "post",
  token,
}: WPPreviewParams): Promise<WPPost | null> {
  if (!WP_API_URL) {
    console.error("WordPress API URL is not configured");
    return null;
  }

  const endpoint = getPostTypeEndpoint(postType);

  // First, try to get the latest revision
  const revisionsUrl = `${WP_API_URL}/wp/v2/${endpoint}/${id}/revisions?per_page=1`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const revisionsResponse = await fetch(revisionsUrl, {
      headers,
      cache: "no-store",
    });

    if (revisionsResponse.ok) {
      const revisions: WPPost[] = await revisionsResponse.json();
      if (revisions.length > 0) {
        // Get the parent post with embedded data and merge with revision content
        const parentPost = await fetchPreviewPost({ id, postType, token });
        if (parentPost) {
          return {
            ...parentPost,
            title: revisions[0].title,
            content: revisions[0].content,
            excerpt: revisions[0].excerpt,
          };
        }
        return revisions[0];
      }
    }

    // Fallback to getting the post directly
    return await fetchPreviewPost({ id, postType, token });
  } catch (error) {
    console.error("Error fetching draft post:", error);
    return null;
  }
}

/**
 * Validate the preview secret token
 */
export function validatePreviewSecret(secret: string | undefined): boolean {
  if (!WP_PREVIEW_SECRET) {
    console.warn("WP_PREVIEW_SECRET is not configured");
    return true; // Allow preview if no secret is configured (development)
  }
  return secret === WP_PREVIEW_SECRET;
}

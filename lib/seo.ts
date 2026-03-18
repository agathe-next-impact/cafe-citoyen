import { Metadata } from 'next';
import { YoastHeadJson } from './wordpress-api';
import { decodeHtmlEntities } from './decode';

export interface SeoFallback {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/** Decode a string if defined, otherwise return undefined */
function d(text: string | undefined): string | undefined {
  return text ? decodeHtmlEntities(text) : undefined;
}

export function generateMetadataFromYoast(yoast: YoastHeadJson | undefined, fallback?: string | SeoFallback): Metadata {
  const fallbackData: SeoFallback = typeof fallback === 'string' ? { title: fallback } : (fallback || {});

  if (!yoast) {
    return {
      title: d(fallbackData.title),
      description: d(fallbackData.description),
      openGraph: {
        title: d(fallbackData.title),
        description: d(fallbackData.description),
        url: fallbackData.url,
        locale: 'fr_FR',
        images: fallbackData.image ? [{ url: fallbackData.image }] : undefined,
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: d(fallbackData.title),
        description: d(fallbackData.description),
        images: fallbackData.image ? [fallbackData.image] : undefined,
      }
    };
  }

  return {
    title: d(yoast.title) || d(fallbackData.title),
    description: d(yoast.description) || d(yoast.og_description) || d(fallbackData.description),
    openGraph: {
      title: d(yoast.og_title) || d(yoast.title) || d(fallbackData.title),
      description: d(yoast.og_description) || d(yoast.description) || d(fallbackData.description),
      url: yoast.og_url || fallbackData.url,
      siteName: d(yoast.og_site_name),
      locale: yoast.og_locale || 'fr_FR',
      type: yoast.og_type as any || 'website',
      images: yoast.og_image?.map((image) => ({
        url: image.url,
        width: image.width,
        height: image.height,
        type: image.type,
      })) || (fallbackData.image ? [{ url: fallbackData.image }] : undefined),
    },
    twitter: {
      card: (yoast.twitter_card as "summary" | "summary_large_image" | "app" | "player") || "summary_large_image",
      site: yoast.twitter_site,
      creator: yoast.twitter_creator,
      title: d(yoast.twitter_title) || d(yoast.og_title) || d(yoast.title) || d(fallbackData.title),
      description: d(yoast.twitter_description) || d(yoast.og_description) || d(yoast.description) || d(fallbackData.description),
      images: yoast.twitter_image || yoast.og_image?.map((image) => image.url) || (fallbackData.image ? [fallbackData.image] : undefined),
    },
    robots: {
      index: yoast.robots?.index === 'index',
      follow: yoast.robots?.follow === 'follow',
      googleBot: {
        index: yoast.robots?.index === 'index',
        follow: yoast.robots?.follow === 'follow',
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: yoast.canonical,
    },
  };
}

import { Metadata } from 'next';
import { YoastHeadJson } from './wordpress-api';

export interface SeoFallback {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function generateMetadataFromYoast(yoast: YoastHeadJson | undefined, fallback?: string | SeoFallback): Metadata {
  const fallbackData: SeoFallback = typeof fallback === 'string' ? { title: fallback } : (fallback || {});

  if (!yoast) {
    return {
      title: fallbackData.title,
      description: fallbackData.description,
      openGraph: {
        title: fallbackData.title,
        description: fallbackData.description,
        url: fallbackData.url,
        images: fallbackData.image ? [{ url: fallbackData.image }] : undefined,
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackData.title,
        description: fallbackData.description,
        images: fallbackData.image ? [fallbackData.image] : undefined,
      }
    };
  }

  return {
    title: yoast.title || fallbackData.title,
    description: yoast.description || yoast.og_description || fallbackData.description,
    openGraph: {
      title: yoast.og_title || yoast.title || fallbackData.title,
      description: yoast.og_description || yoast.description || fallbackData.description,
      url: yoast.og_url || fallbackData.url,
      siteName: yoast.og_site_name,
      locale: yoast.og_locale,
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
      title: yoast.twitter_title || yoast.og_title || yoast.title || fallbackData.title,
      description: yoast.twitter_description || yoast.og_description || yoast.description || fallbackData.description,
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

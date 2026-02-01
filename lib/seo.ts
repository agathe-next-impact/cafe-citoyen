import { Metadata } from 'next';
import { YoastHeadJson } from './wordpress-api';

export function generateMetadataFromYoast(yoast: YoastHeadJson | undefined, fallbackTitle?: string): Metadata {
  if (!yoast) {
    return {
      title: fallbackTitle,
    };
  }

  return {
    title: yoast.title,
    description: yoast.description || yoast.og_description,
    openGraph: {
      title: yoast.og_title || yoast.title,
      description: yoast.og_description || yoast.description,
      url: yoast.og_url,
      siteName: yoast.og_site_name,
      locale: yoast.og_locale,
      type: yoast.og_type as any || 'website',
      images: yoast.og_image?.map((image) => ({
        url: image.url,
        width: image.width,
        height: image.height,
        type: image.type,
      })),
    },
    twitter: {
      card: (yoast.twitter_card as "summary" | "summary_large_image" | "app" | "player") || "summary_large_image",
      site: yoast.twitter_site,
      creator: yoast.twitter_creator,
      images: yoast.og_image?.map((image) => image.url),
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

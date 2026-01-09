"use client";

import { useState, useLayoutEffect, useRef } from "react";

interface PageContentProps {
  content?: string;
  images?: Array<{
    url: string;
    alt: string;
    title: string;
    ID: number;
    height: number;
    width: number;
  }>;
}

function decodeHtmlEntities(text: string): string {
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
    .replace(/&nbsp;/g, " ");
}

export function PageContent({ content, images }: PageContentProps) {
  const [articleHeight, setArticleHeight] = useState<number>(0);
  const articleRef = useRef<HTMLElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null);

  if (!content && (!images || images.length === 0)) {
    return null;
  }

  // Mesurer la hauteur de l'article et l'appliquer à la colonne d'images
  useLayoutEffect(() => {
    const measureHeight = () => {
      if (articleRef.current) {
        const height = articleRef.current.offsetHeight;
        setArticleHeight(height);
      }
    };

    measureHeight();

    // Observer le redimensionnement
    const resizeObserver = new ResizeObserver(measureHeight);
    if (articleRef.current) {
      resizeObserver.observe(articleRef.current);
    }

    // Observer le redimensionnement de la fenêtre
    window.addEventListener("resize", measureHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [content]);

  // Générer des spans de colonnes aléatoires pour chaque image (limité à 3x3)
  const getRandomColumnSpan = () => {
    const spans = ["col-span-1", "col-span-2", "col-span-3"];
    return spans[Math.floor(Math.random() * spans.length)];
  };

  const getRandomRowSpan = () => {
    const spans = ["row-span-1", "row-span-2", "row-span-3"];
    return spans[Math.floor(Math.random() * spans.length)];
  };

  return (
    <section className="md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        {/* Colonne des images à gauche */}
        {images && images.length > 0 && (
          <div className="md:col-span-1">
            <div
              ref={imageColumnRef}
              className="sticky top-24 space-y-4 overflow-hidden"
              style={{
                height: articleHeight > 0 ? `${articleHeight}px` : "auto",
                maxHeight: articleHeight > 0 ? `${articleHeight}px` : "none",
              }}
            >
              {images.map((image, index) => (
                <div 
                  key={`image-${image.ID || index}`} 
                  className="overflow-hidden rounded-2xl"
                >
                  <img 
                    src={image.url} 
                    alt={image.alt || 'Image du contenu'} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Colonne du contenu à droite */}
        <div
          className={`marker:x-h-max mx-auto ${
            images && images.length > 0
              ? "md:col-span-4"
              : "col-span-1 md:col-span-5"
          }`}
        >
          {/* WYSIWYG Content */}
          {content && (
            <article ref={articleRef} className="prose prose-lg max-w-none">
              <div
                className="text-foreground/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </article>
          )}
        </div>
      </div>

      {/* Bento en bas avec les images */}
      {images && images.length > 3 && (
        <div
          className="w-full mt-12 grid grid-cols-6 grid-rows-1 gap-4 aspect-square mx-auto"
          style={{
            gridTemplateRows: "repeat(2, minmax(0, 100px))", // Hauteur max de 200px par ligne
            gridAutoRows: "minmax(0, 60px)", // Pour les lignes supplémentaires
          }}
        >
          {images.map((image, index) => {
            const colSpan = getRandomColumnSpan();
            const rowSpan = getRandomRowSpan();

            return (
              <div
                key={`bento-image-${image.ID || index}`}
                className={`overflow-hidden rounded-2xl ${colSpan} ${rowSpan}`}
              >
                <img
                  src={image.url}
                  alt={image.alt || "Image du contenu"}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

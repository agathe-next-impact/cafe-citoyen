"use client";

import { useState, useLayoutEffect, useRef } from "react";

interface Card {
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
}

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
  encadres?: Card[];
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

export function PageContent({ content, images, encadres }: PageContentProps) {
  const [contentAndCardsHeight, setContentAndCardsHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null);
  const [visibleImages, setVisibleImages] = useState(Array.isArray(images) ? images : []);

  if (!content && (!Array.isArray(images) || images.length === 0)) {
    return null;
  }

  useLayoutEffect(() => {
    const measureHeight = () => {
      if (contentRef.current && imageColumnRef.current) {
        const totalHeight = contentRef.current.offsetHeight;
        let imgs = Array.isArray(images) ? images : [];
        let imgHeights: number[] = [];

        // Crée des refs temporaires pour mesurer la hauteur des images
        const tempDiv = document.createElement("div");
        tempDiv.style.visibility = "hidden";
        tempDiv.style.position = "absolute";
        tempDiv.style.width = imageColumnRef.current.offsetWidth + "px";
        document.body.appendChild(tempDiv);

        imgs.forEach((img, idx) => {
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.style.width = "100%";
          imgEl.style.display = "block";
          tempDiv.appendChild(imgEl);
          imgEl.onload = () => {
            imgHeights[idx] = imgEl.offsetHeight;
            if (imgHeights.length === imgs.length) {
              let totalImgHeight = imgHeights.reduce((a, b) => a + b, 0);
              // Si la colonne est trop haute, retire la dernière image
              while (totalImgHeight > totalHeight && imgs.length > 0) {
                imgs = imgs.slice(0, -1);
                imgHeights = imgHeights.slice(0, -1);
                totalImgHeight = imgHeights.reduce((a, b) => a + b, 0);
              }
              // Masquer la dernière image, même si elle rentre
              if (imgs.length > 1) {
                imgs = imgs.slice(0, -1);
              }
              setVisibleImages(imgs);
              document.body.removeChild(tempDiv);
            }
          };
        });

        setContentAndCardsHeight(totalHeight);
      }
    };

    measureHeight();

    const resizeObserver = new ResizeObserver(measureHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    window.addEventListener("resize", measureHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [content, images, encadres]);

  // Générer des spans de colonnes aléatoires pour chaque image (limité à 3x3)
  const getRandomColumnSpan = () => {
    const spans = ["col-span-1", "col-span-2", "col-span-3"];
    return spans[Math.floor(Math.random() * spans.length)];
  };

  const getRandomRowSpan = () => {
    const spans = ["row-span-1", "row-span-2", "row-span-3"];
    return spans[Math.floor(Math.random() * spans.length)];
  };

  console.log("Cartes encadres reçues :", encadres);

  return (
    <section className="md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        {/* Colonne des images à gauche */}
        {Array.isArray(visibleImages) && visibleImages.length > 0 && (
          <div className="md:col-span-1">
            <div
              ref={imageColumnRef}
              className="sticky top-24 space-y-4 overflow-hidden"
              style={{
                height: contentAndCardsHeight > 0 ? `${contentAndCardsHeight}px` : "auto",
                maxHeight: contentAndCardsHeight > 0 ? `${contentAndCardsHeight}px` : "none",
              }}
            >
              {visibleImages.map((image, index) => (
                <div
                  key={`image-${image.ID || index}`}
                  className="overflow-hidden rounded-2xl"
                >
                  <img
                    src={image.url}
                    alt={image.alt || "Image du contenu"}
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
          <div ref={contentRef}>
            {/* WYSIWYG Content */}
            {content && (
              <article className="prose prose-lg max-w-none">
                <div
                  className="text-foreground/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </article>
            )}

            {/* Grille de cartes encadrés (2 colonnes) */}
            {Array.isArray(encadres) && encadres.length > 0 && (
              <div className="mt-10 flex flex-col gap-12">
                {encadres.slice(0, 2).map((card, idx) => (
                  <div
                    key={`encadre-${idx}`}
                    className="bg-white rounded-xl shadow flex flex-row items-stretch min-h-[160px] overflow-hidden relative group"
                  >
                    <div className="flex flex-col gap-2 justify-center w-3/4 p-6 z-10 relative">
                      {card.titre && (
                        <h3 className="text-2xl font-bold">{card.titre}</h3>
                      )}
                      {card.texte && (
                        <div
                          className="prose prose-sm text-gray-700"
                          dangerouslySetInnerHTML={{ __html: card.texte }}
                        />
                      )}
                    </div>
                    {card.illustration?.url && (
                      <div
                        className="absolute right-0 top-0 bottom-0 h-full z-20 bg-white transition-all duration-1200 w-1/4 group-hover:w-1/3 group-hover:shadow-2xl after:content-[''] after:absolute after:inset-0 after:transition-all after:duration-600 pointer-events-none"
                        style={{
                          backgroundImage: `url(${card.illustration.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        aria-label={card.illustration.alt || card.titre || 'Illustration'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Le bento d'images en bas de page a été supprimé */}
    </section>
  );
}

"use client";

import { useState, useLayoutEffect, useRef, useEffect } from "react";
import Image from "next/image";
import { WPDecode } from "@/components/wp-decode"; // Ajout de l'import

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
  slug?: string;
  images?: Array<{
    url: string;
    alt: string;
    title: string;
    ID: number;
    height: number;
    width: number;
  }>;
  encadres?: Card[];
  teamVideoUrl?: string; // Ajout ici
}

export function PageContent({ content, slug, images, encadres, teamVideoUrl }: PageContentProps) {
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
        
        // Utilise les dimensions fournies au lieu de charger les images
        let totalImgHeight = imgs.reduce((sum, img) => {
          const aspectRatio = img.width / img.height;
          const containerWidth = imageColumnRef.current?.offsetWidth || 300;
          const calculatedHeight = containerWidth / aspectRatio;
          return sum + calculatedHeight + 16; // 16px = gap-4
        }, 0);

        // Si la colonne est trop haute, retire les dernières images
        while (totalImgHeight > totalHeight && imgs.length > 0) {
          const lastImg = imgs[imgs.length - 1];
          const aspectRatio = lastImg.width / lastImg.height;
          const containerWidth = imageColumnRef.current?.offsetWidth || 300;
          const calculatedHeight = containerWidth / aspectRatio;
          totalImgHeight -= calculatedHeight + 16;
          imgs = imgs.slice(0, -1);
        }

        // Masquer la dernière image, même si elle rentre
        if (imgs.length > 1) {
          imgs = imgs.slice(0, -1);
        }

        setVisibleImages(imgs);
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

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 top-0 h-screen w-screen" />
      <section className="relative md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6 z-10">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Colonne des images à gauche */}
          {Array.isArray(visibleImages) && visibleImages.length > 0 && (
            <div className="hidden md:block md:col-span-1">
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
                    className="overflow-hidden border-2 border-black"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || "Image du contenu"}
                      width={100}
                      height={100}
                      className="w-full h-auto object-cover"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colonne du contenu à droite */}
          <div
            className={`marker:x-h-max  w-full mx-auto ${
              images && images.length > 0
                ? "md:col-span-4"
                : "col-span-1 md:col-span-5"
            }`}
          >
            <div ref={contentRef}>
              {/* Vidéo de l'équipe */}
              {teamVideoUrl && (
                <div className="mb-8 py-8 mx-auto bg-black flex justify-center overflow-hidden shadow-lg">
                  <video
                    controls={false}
                    autoPlay
                    muted
                    loop
                    className="md:w-2/3 shadow-lg"
                    src={teamVideoUrl}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              )}

              {/* WYSIWYG Content */}
              {content && (
                <article className="prose prose-lg max-w-none">
                  <div
                    className="text-foreground/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: WPDecode({ children: content }).props.children }}
                  />
                </article>
              )}

              {/* Grille de cartes encadrés (2 colonnes) */}
              {Array.isArray(encadres) && encadres.length > 0 && (
                <div className="mt-10 flex flex-col gap-12">
                  {encadres.slice(0, 2).map((card, idx) => (
                    <div
                      key={`encadre-${idx}`}
                      className="bg-white flex flex-col md:flex-row items-stretch min-h-[160px] overflow-hidden relative group border-2 border-black"
                    >
                      <div className="flex flex-col gap-2 justify-center w-full md:w-3/4 p-6 z-10 relative">
                        {card.titre && (
                          <h3 className="text-2xl font-bold">
                            <WPDecode>{card.titre}</WPDecode>
                          </h3>
                        )}
                        {card.texte && (
                          <div
                            className="prose prose-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: WPDecode({ children: card.texte }).props.children }}
                          />
                        )}
                      </div>
                      {card.illustration?.url && (
                        <div
                          className="relative md:absolute right-0 top-0 bottom-0 h-64 md:h-full w-full md:w-1/4 z-20 bg-white transition-all duration-1200 md:group-hover:w-1/3 group-hover:shadow-2xl after:content-[''] after:absolute after:inset-0 after:transition-all after:duration-600 pointer-events-none"
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
      </section>
    </>
  );
}

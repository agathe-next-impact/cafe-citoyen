"use client";

import { useState, useLayoutEffect, useRef } from 'react';

interface PageContentProps {
  content?: string
  images?: Array<{
    url: string
    alt: string
    title: string
    ID: number
    height: number
    width: number
  }>
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
    .replace(/&nbsp;/g, " ")
}

export function PageContent({ content, images }: PageContentProps) {
  if (!content && (!images || images.length === 0)) {
    return null
  }

  return (
    <section className="md:w-max-[90%] lg:max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        {/* Colonne des images à gauche */}
        {images && images.length > 0 && (
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {images.slice(0, 3).map((image, index) => (
                <div 
                  key={`image-${image.ID || index}`} 
                  className="overflow-hidden rounded-lg"
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
        <div className={`mx-auto ${images && images.length > 0 ? 'md:col-span-4' : 'col-span-1 md:col-span-5'}`}>
          {/* WYSIWYG Content */}
          {content && (
            <article className="prose prose-lg max-w-none">
              <div className="text-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

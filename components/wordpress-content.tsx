'use client'

import { useEffect, useRef } from 'react'

interface WordPressContentProps {
  content: string
  className?: string
}

export function WordPressContent({ content, className = '' }: WordPressContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fonction pour gérer les messages de redimensionnement HelloAsso
    const handleHelloAssoMessage = (e: MessageEvent) => {
      // Vérifier que le message vient bien de HelloAsso
      if (e.origin !== 'https://www.helloasso.com') return

      // Vérifier qu'il y a une hauteur dans le message
      if (!e.data.height) return

      // Trouver tous les iframes HelloAsso dans ce contenu
      if (contentRef.current) {
        const iframes = contentRef.current.querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="helloasso.com"]'
        )

        iframes.forEach((iframe) => {
          // Ajuster la hauteur de chaque iframe
          iframe.style.height = e.data.height + 'px'
        })
      }
    }

    // Ajouter l'event listener
    window.addEventListener('message', handleHelloAssoMessage)

    // Nettoyage à la destruction du composant
    return () => {
      window.removeEventListener('message', handleHelloAssoMessage)
    }
  }, [])

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

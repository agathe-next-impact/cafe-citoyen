'use client'

import { useEffect, useRef } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'

interface WordPressContentProps {
  content: string
  className?: string
}

export function WordPressContent({ content, className = '' }: WordPressContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Debug: Log le contenu brut pour voir s'il y a un problème d'encodage
  useEffect(() => {
    if (content.includes('helloasso.com')) {
      console.log('[WordPressContent] Contenu brut reçu:', content.substring(0, 500))
      console.log('[WordPressContent] Contient iframe HelloAsso:', content.includes('<iframe'))
      console.log('[WordPressContent] Contient iframe encodé:', content.includes('&lt;iframe'))
    }
  }, [content])

  useEffect(() => {
    // Nettoyer les iframes HelloAsso de tout JavaScript inline problématique
    const cleanHelloAssoIframes = () => {
      if (contentRef.current) {
        const iframes = contentRef.current.querySelectorAll<HTMLIFrameElement>(
          'iframe[src*="helloasso.com"]'
        )

        iframes.forEach((iframe) => {
          // Vérifier si l'iframe a déjà été nettoyé
          if (iframe.dataset.cleaned === 'true') return

          let needsCleaning = false

          // Supprimer l'attribut onload qui contient le listener problématique
          if (iframe.hasAttribute('onload')) {
            console.warn('[WordPressContent] Suppression de l\'attribut onload sur iframe HelloAsso')
            iframe.removeAttribute('onload')
            needsCleaning = true
          }

          // Supprimer tout autre event listener inline potentiellement problématique
          if (iframe.hasAttribute('onerror')) {
            console.warn('[WordPressContent] Suppression de l\'attribut onerror sur iframe HelloAsso')
            iframe.removeAttribute('onerror')
            needsCleaning = true
          }

          // Nettoyer les propriétés JS inline
          if ((iframe as any).onload) {
            (iframe as any).onload = null
            needsCleaning = true
          }
          if ((iframe as any).onerror) {
            (iframe as any).onerror = null
            needsCleaning = true
          }

          // Marquer comme nettoyé pour éviter les traitements répétés
          if (needsCleaning) {
            iframe.dataset.cleaned = 'true'
            console.warn('[WordPressContent] Iframe HelloAsso nettoyé avec succès')
          }
        })
      }
    }

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

    // Nettoyer les iframes immédiatement
    cleanHelloAssoIframes()

    // Surveiller les changements DOM pour nettoyer les iframes ajoutés dynamiquement
    const observer = new MutationObserver(() => {
      cleanHelloAssoIframes()
    })

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      })
    }

    // Ajouter l'event listener
    window.addEventListener('message', handleHelloAssoMessage)

    // Nettoyage à la destruction du composant
    return () => {
      window.removeEventListener('message', handleHelloAssoMessage)
      observer.disconnect()
    }
  }, [])

  // Nettoyer le contenu HTML AVANT injection pour éviter les conflits JS
  const cleanedContent = content
    // Supprimer TOUS les attributs d'événements (on*) des iframes
    .replace(
      /(<iframe[^>]*?)\s+on\w+\s*=\s*["'][^"']*["']([^>]*?>)/gi,
      (_match, before, after) => {
        // Répéter jusqu'à ce que tous les attributs on* soient supprimés
        let result = before + after;
        while (/\s+on\w+\s*=\s*["'][^"']*["']/i.test(result)) {
          result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/i, '');
        }
        return result;
      }
    )
    // Ajouter sandbox pour sécuriser les iframes HelloAsso
    .replace(
      /(<iframe[^>]*src=["']https?:\/\/[^"']*helloasso\.com[^"']*["'][^>]*?)(\/?>)/gi,
      (match, iframeTag, closing) => {
        // Ajouter sandbox si pas déjà présent
        if (!iframeTag.includes('sandbox')) {
          return iframeTag + ' sandbox="allow-scripts allow-same-origin allow-forms allow-popups"' + closing;
        }
        return match;
      }
    )

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanedContent) }}
    />
  )
}

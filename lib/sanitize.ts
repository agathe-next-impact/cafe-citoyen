import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize HTML content from WordPress to prevent XSS attacks.
 * Allows safe HTML tags used in WordPress content (headings, paragraphs, links, images, etc.)
 * while removing dangerous elements like <script>, <iframe>, event handlers, etc.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

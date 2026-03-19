import sanitize from "sanitize-html"

/**
 * Sanitize HTML content from WordPress to prevent XSS attacks.
 * Allows safe HTML tags used in WordPress content (headings, paragraphs, links, images, etc.)
 * while removing dangerous elements like <script>, event handlers, etc.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return sanitize(html, {
    allowedTags: [
      // Structure
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "div", "span", "br", "hr",
      "blockquote", "pre", "code",
      // Lists
      "ul", "ol", "li",
      // Inline
      "a", "strong", "b", "em", "i", "u", "s", "sub", "sup", "small", "mark",
      // Media
      "img", "figure", "figcaption", "picture", "source", "video", "audio",
      // Tables
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
      // Embeds (WordPress)
      "iframe",
      // WordPress blocks
      "section", "article", "aside", "header", "footer", "nav", "main",
      "details", "summary",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "class", "id"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class", "id", "sizes"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "scrolling", "title", "class"],
      video: ["src", "width", "height", "controls", "autoplay", "muted", "loop", "poster", "class"],
      audio: ["src", "controls", "class"],
      source: ["src", "srcset", "type", "media", "sizes"],
      td: ["colspan", "rowspan", "class"],
      th: ["colspan", "rowspan", "class", "scope"],
      col: ["span"],
      colgroup: ["span"],
      div: ["class", "id", "style"],
      span: ["class", "id", "style"],
      p: ["class", "id", "style"],
      section: ["class", "id", "style"],
      figure: ["class", "id", "style"],
      blockquote: ["class", "id", "cite"],
      h1: ["class", "id"],
      h2: ["class", "id"],
      h3: ["class", "id"],
      h4: ["class", "id"],
      h5: ["class", "id"],
      h6: ["class", "id"],
      ul: ["class", "id"],
      ol: ["class", "id", "start", "type"],
      li: ["class", "id"],
      pre: ["class", "id"],
      code: ["class", "id"],
      table: ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com", "www.dailymotion.com"],
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "color": [/^#[0-9a-fA-F]{3,6}$/],
      },
    },
  })
}

// Composant utilitaire pour décoder les entités HTML WordPress

import React from "react";

export function decodeHtmlEntities(str: string) {
  if (!str) return "";
  const namedEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&rsquo;': '’',
    '&lsquo;': '‘',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&agrave;': 'à',
    '&ccedil;': 'ç',
    '&ocirc;': 'ô',
    '&ucirc;': 'û',
    '&icirc;': 'î',
    '&acirc;': 'â',
    '&uuml;': 'ü',
    '&ouml;': 'ö',
    '&auml;': 'ä',
    '&euml;': 'ë',
    '&iuml;': 'ï',
    '&oelig;': 'œ',
    '&sbquo;': '‚',
    '&bdquo;': '„',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&iexcl;': '¡',
    '&iquest;': '¿',
    '&bull;': '•',
    '&middot;': '·',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&sect;': '§',
    '&deg;': '°',
    '&para;': '¶',
    '&laquo;': '«',
    '&raquo;': '»',
    '&lsaquo;': '‹',
    '&rsaquo;': '›',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&permil;': '‰',
  };
  let out = str.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (namedEntities[entity]) return namedEntities[entity];
    // Entités numériques décimales
    const matchDec = entity.match(/^&#(\d+);$/);
    if (matchDec) return String.fromCharCode(Number(matchDec[1]));
    // Entités numériques hexadécimales
    const matchHex = entity.match(/^&#x([0-9a-fA-F]+);$/);
    if (matchHex) return String.fromCharCode(parseInt(matchHex[1], 16));
    return entity;
  });
  return out;
}

export function WPDecode({ children }: { children: string }) {
  return <>{decodeHtmlEntities(children)}</>;
}
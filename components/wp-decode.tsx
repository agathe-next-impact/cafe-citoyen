// Composant utilitaire pour décoder les entités HTML WordPress

import React from "react";
import { decodeHtmlEntities } from "@/lib/decode";

export { decodeHtmlEntities };

export function WPDecode({ children }: { children: string }) {
  return <>{decodeHtmlEntities(children)}</>;
}

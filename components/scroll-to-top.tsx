"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Prevent browser from restoring scroll position
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }

    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return null
}

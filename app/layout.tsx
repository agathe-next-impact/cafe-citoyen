import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display } from "next/font/google"
import { AnimatedNavWrapper } from "@/components/animated-nav-wrapper"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { BallGarland } from "@/components/ball-garland"
import { getSiteOptions } from "@/lib/wordpress-api"
import "./globals.css"
import '@wordpress/block-library/build-style/style.css';

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-sans",
})

export async function generateMetadata(): Promise<Metadata> {
  const siteOptions = await getSiteOptions()

  return {
    title: siteOptions?.titre_du_site || "",
    description:
      siteOptions?.description_du_site ||
      "",
    generator: "",
    other: {
      charset: "utf-8",
    },
    icons: {
      icon: siteOptions?.logo_du_site?.url
        ? [
            {
              url: siteOptions.logo_du_site.url,
              type: "image/png",
            },
          ]
        : [
            {
              url: "/icon-light-32x32.png",
              media: "(prefers-color-scheme: light)",
            },
            {
              url: "/icon-dark-32x32.png",
              media: "(prefers-color-scheme: dark)",
            },
            {
              url: "/icon.svg",
              type: "image/svg+xml",
            },
          ],
      apple: siteOptions?.logo_du_site?.url || "/apple-icon.png",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo-cafe-citoyen.png" />
      </head>
      <body suppressHydrationWarning className={redHatDisplay.variable + " bg-amber-50/10"}>
        <ScrollToTop />
        <AnimatedNavWrapper />
        <BallGarland />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

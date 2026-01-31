import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display, Crimson_Text } from "next/font/google"
import { AnimatedNavWrapper } from "@/components/animated-nav-wrapper"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteOptions } from "@/lib/wordpress-api"
import dynamic from "next/dynamic"
import "./globals.css"
import '@wordpress/block-library/build-style/style.css';

// Lazy-load du Footer (non critique pour le rendu initial)
const Footer = dynamic(() => import("@/components/footer").then(mod => mod.Footer), {
  loading: () => <footer className="h-64 bg-black" />,
})

// Lazy-load de BallGarland (décoratif, non critique)
const BallGarland = dynamic(() => import("@/components/ball-garland").then(mod => mod.BallGarland))

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteOptions = await getSiteOptions()
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo-cafe-citoyen.png" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
      </head>
      <body suppressHydrationWarning className={`${redHatDisplay.variable} ${crimsonText.variable} bg-amber-50/10`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ScrollToTop />
          <AnimatedNavWrapper siteOptions={siteOptions} />
          <BallGarland />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

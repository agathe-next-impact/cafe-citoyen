import type React from "react"
import type { Metadata } from "next"
import { AnimatedNavWrapper } from "@/components/animated-nav-wrapper"
import { ScrollToTop } from "@/components/scroll-to-top"

import { getSiteOptions, getWordPressPages, organizePagesByParent } from "@/lib/wordpress-api"
import dynamic from "next/dynamic"
import { PageTransition } from "@/components/page-transition" // Import the new component
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import localFont from "next/font/local"
// Lazy-load du Footer (non critique pour le rendu initial)
const Footer = dynamic(() => import("@/components/footer").then(mod => mod.Footer), {
  loading: () => <footer className="h-64 bg-black" />,
})

// Lazy-load de BallGarland (décoratif, non critique)
const BallGarland = dynamic(() => import("@/components/ball-garland").then(mod => mod.BallGarland))

// Lazy-load du popup newsletter (affiché rarement, pas besoin au chargement initial)
const ExitIntentPopup = dynamic(() => import("@/components/exit-intent-popup").then(mod => mod.ExitIntentPopup))



// polices locales
const bodedo = localFont({
  src: "./fonts/Bodedo.ttf", // Chemin relatif depuis layout.tsx
  variable: "--font-serif", // Nom de la variable CSS
  display: "swap",
})

const recoleta = localFont({
  src: "./fonts/Recoleta-Regular.ttf", // Chemin relatif depuis layout.tsx
  variable: "--font-sans", // Nom de la variable CSS
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
    openGraph: {
      locale: "fr_FR",
      siteName: siteOptions?.titre_du_site || "Café Citoyen",
    },
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
  const [siteOptions, pages] = await Promise.all([
    getSiteOptions(),
    getWordPressPages(),
  ])
  const menuData = organizePagesByParent(pages)
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo-cafe-citoyen.png" />
        <link rel="preconnect" href="https://wp-back.cafecitoyen.art" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://s.ytimg.com" />
      </head>
      <body
        className={`antialiased ${recoleta.variable} ${bodedo.variable}`}
      >      
      {/* Exit Intent Popup */}
        <ExitIntentPopup
          title="Rejoignez notre newsletter !"
          description="Ne manquez rien des actualités du Café Citoyen. Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et la programmation directement dans votre boîte mail."
          buttonText="S'inscrire"
          sensitivity={20}
          showOnce={true}
          mobileTrigger="scroll-depth"
          mobileTimerDelay={30000}
          mobileScrollDepth={50}
          mobileInactivityDelay={15000}
        />
          <ScrollToTop />
          <AnimatedNavWrapper siteOptions={siteOptions} menuData={menuData} />
          <BallGarland />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        <Analytics />
      </body>
    </html>
  )
}

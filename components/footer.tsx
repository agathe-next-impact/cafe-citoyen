import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative border-t border-border overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at bottom right, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.25) 24%, rgba(59,130,246,0.15) 42%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,1) 100%)",
        }}
      />
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex items-center justify-center h-10 w-10 rounded border-2 border-white">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span className="text-base font-light">château de goutelas</span>
            </div>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">Un patrimoine vivant en Forez</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-normal uppercase tracking-widest">Le Château</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li>
                <Link href="/histoire" className="hover:text-foreground transition-colors">
                  Histoire
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-foreground transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/visite" className="hover:text-foreground transition-colors">
                  Visiter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-normal uppercase tracking-widest">Culture</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li>
                <Link href="/agenda" className="hover:text-foreground transition-colors">
                  Agenda
                </Link>
              </li>
              <li>
                <Link href="/expositions" className="hover:text-foreground transition-colors">
                  Expositions
                </Link>
              </li>
              <li>
                <Link href="/seminaires" className="hover:text-foreground transition-colors">
                  Séminaires
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-normal uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/acces" className="hover:text-foreground transition-colors">
                  Accès
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-light uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Château de Goutelas - Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  )
}

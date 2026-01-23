import Link from "next/link"
import { Video } from "next-video"

export function Footer() {
  return (
    <footer className="relative border-t border-yellow-50 overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at bottom right, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.25) 24%, rgba(59,130,246,0.15) 42%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,1) 100%)",
        }}
      />
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h4 className="mb-4 text-right text-sm font-normal uppercase tracking-widest">Réseau</h4>
            <ul className="space-y-3 text-right text-sm text-muted-foreground font-light">
              <li>
                <Link href="https://www.lesdoleances.fr" className="hover:text-foreground transition-colors">
                  Asso Les Doléances
                </Link>
              </li>
              <li>
                <Link href="https://lesetatsgenerauxcommunaux.org" className="hover:text-foreground transition-colors">
                  Les Etats Généraux Communaux
                </Link>
              </li>
            </ul>
          </div>


          <div>
            <video
              src="/videos/logo-cc.mp4"
              className="rounded-2xl shadow-lg"
              no-controls
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "auto" }}
            />
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
                <Link href="/infos-pratiques" className="hover:text-foreground transition-colors">
                  Venir
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-yellow-50 text-center">
    
          <Link href="/mentions-legales" className="mb-8 text-xs text-muted-foreground font-light uppercase tracking-widest">
            Mentions légales
          </Link>
        
          <p className="mb-4 text-xs text-muted-foreground font-light uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Café citoyen - Tous droits réservés
          </p>
          <p className="mb-8 text-xs text-muted-foreground font-light">
            Développé par{' '}
            <a
              href="https://www.next-impact.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:text-foreground transition-colors"
            >
              Next Impact
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

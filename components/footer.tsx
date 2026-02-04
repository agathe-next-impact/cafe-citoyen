import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative border-t border-black overflow-hidden bg-black">
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:gap-12 md:grid-cols-3">
          <div>
            <h4 className="md:mb-4 md:text-right text-sm font-normal uppercase tracking-widest">Réseau</h4>
            <ul className="space-y-3 md:text-right text-sm text-white/90 font-light">
              <li>
                <Link href="https://www.lesdoleances.fr" className="hover:text-white/90 hover:underline transition-colors">
                  Asso Les Doléances
                </Link>
              </li>
              <li>
                <Link href="https://lesetatsgenerauxcommunaux.org" className="hover:text-white/90 hover:underline transition-colors">
                  Les Etats Généraux Communaux
                </Link>
              </li>
            </ul>
          </div>


          <div className="order-first md:order-none">
            <video
              src="/videos/logo-cc.mp4"
              controls={false}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          <div>
            <h4 className="md:mb-4 text-sm font-normal uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3 text-sm text-white/90 font-light">
              <li>
                <Link href="/equipe-nous-contacter" className="hover:text-white/90 hover:underline transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/visiter" className="hover:text-white/90 hover:underline transition-colors">
                  Venir
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-yellow-50 text-center">
    
          <Link href="/mentions-legales" className="mb-8 text-xs text-white/90 hover:underline font-light uppercase tracking-widest">
            Mentions légales
          </Link>
        
          <p className="mb-4 text-xs text-white/90 font-light uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Café citoyen - Tous droits réservés
          </p>
          <p className="mb-8 text-xs text-white/90 font-light hover:text-white">
            Développé par{' '}
              &nbsp;
            <a
              href="https://www.next-impact.digital/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:underline transition-colors"
            >Next Impact
              <Image
                src="/logo-nid.webp"
                alt="Next Impact"
                width={20}
                height={20}
                className="ml-2 inline-block"
                />
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

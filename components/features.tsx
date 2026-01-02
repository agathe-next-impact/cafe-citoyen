export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Artistic banner section */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="relative aspect-[4/5] overflow-hidden bg-[oklch(0.8_0.08_200)] flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              {/* Decorative pattern */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary" />
              <div className="absolute top-1/3 left-1/2 w-12 h-12 rounded-full bg-primary" />
              <div className="absolute bottom-1/3 left-1/3 w-20 h-20 rounded-full bg-primary" />
            </div>
            <div className="relative z-10 p-12">
              <h2 className="text-4xl md:text-5xl font-light text-secondary mb-8">
                Réparer
                <br />
                le monde
              </h2>
              <p className="text-xl font-light text-foreground/80">
                saison
                <br />
                culturelle
                <br />
                2025
                <br />
                2026
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden">
            <img src="/colorful-artistic-illustration-green-circles-coral.jpg" alt="Art contemporain" className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Upcoming events section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-primary/10">
            <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-light mb-4">prochains rendez-vous</h2>
          <button className="mt-8 px-6 py-3 border border-border text-sm uppercase tracking-widest font-light hover:bg-accent transition-colors">
            VOIR TOUS LES ÉVÉNEMENTS +
          </button>
        </div>

        {/* Event cards grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-4 bg-[oklch(0.85_0.15_120)]">
              <img
                src="/festival-bien-commun-yellow-green-illustration.jpg"
                alt="Festival Bien Commun"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-light mb-2">FESTIVAL BIEN COMMUN #1</h3>
            <p className="text-sm text-muted-foreground font-light">SERVICE PUBLIC !</p>
          </div>

          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-4">
              <img
                src="/people-reading-books-library-workshop.jpg"
                alt="Atelier lecture"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-light mb-2">ATELIERS & RENCONTRES</h3>
            <p className="text-sm text-muted-foreground font-light">Toute l'année</p>
          </div>

          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-4">
              <img
                src="/old-manuscripts-archives-documents.jpg"
                alt="Archives"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-light mb-2">CAHIER DES DÉLIAISONS</h3>
            <p className="text-sm text-muted-foreground font-light">Édition Gutenberg</p>
          </div>
        </div>
      </div>
    </section>
  )
}

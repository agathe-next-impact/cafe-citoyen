export function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden z-[105]">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/french-chateau-courtyard-aerial-view-people-gather.jpg"
          alt="Vue du château"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight text-balance">
            Goutelas,
            <br />
            <span className="block mt-2">un patrimoine</span>
            <span className="block mt-2">vivant en Forez</span>
          </h1>

          <div className="mt-16 space-y-2 max-w-md">
            {[
              { title: "LE Café citoyen", icon: "+" },
              { title: "PROJET CULTUREL", icon: "+" },
              { title: "SÉMINAIRES & ÉVÉNEMENTS", icon: "+" },
              { title: "VOTRE VISITE", icon: "+" },
            ].map((item) => (
              <button
                key={item.title}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all text-left group"
              >
                <span className="text-xs uppercase tracking-widest font-light">{item.title}</span>
                <span className="text-2xl font-light transition-transform group-hover:rotate-90">{item.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

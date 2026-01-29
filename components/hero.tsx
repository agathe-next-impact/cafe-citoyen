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

      </div>
    </section>
  )
}

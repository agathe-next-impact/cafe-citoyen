import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen pt-20 flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page non trouvée</h2>
          <p className="text-muted-foreground mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}

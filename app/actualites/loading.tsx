export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="bg-black h-[200px]" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-black animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 w-3/4" />
                <div className="h-4 bg-gray-100 w-full" />
                <div className="h-4 bg-gray-100 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

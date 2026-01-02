import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SiteCardProps {
  title: string
  description?: string
  image?: string
  imageAlt?: string
  href?: string
  category?: string
  date?: string
  variant?: "primary" | "secondary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  className?: string
  children?: React.ReactNode
}

const variantColors = {
  primary: {
    gradient: "from-primary to-primary/80",
    button: "bg-primary shadow-primary/20 hover:shadow-primary/40",
    badge: "bg-primary/20 text-primary",
  },
  secondary: {
    gradient: "from-secondary to-secondary/80",
    button: "bg-secondary shadow-secondary/20 hover:shadow-secondary/40",
    badge: "bg-secondary/20 text-secondary",
  },
  "chart-1": {
    gradient: "from-chart-1 to-chart-1/80",
    button: "bg-chart-1 shadow-chart-1/20 hover:shadow-chart-1/40",
    badge: "bg-chart-1/20 text-chart-1",
  },
  "chart-2": {
    gradient: "from-chart-2 to-chart-2/80",
    button: "bg-chart-2 shadow-chart-2/20 hover:shadow-chart-2/40",
    badge: "bg-chart-2/20 text-chart-2",
  },
  "chart-3": {
    gradient: "from-chart-3 to-chart-3/80",
    button: "bg-chart-3 shadow-chart-3/20 hover:shadow-chart-3/40",
    badge: "bg-chart-3/20 text-chart-3",
  },
  "chart-4": {
    gradient: "from-chart-4 to-chart-4/80",
    button: "bg-chart-4 shadow-chart-4/20 hover:shadow-chart-4/40",
    badge: "bg-chart-4/20 text-chart-4",
  },
  "chart-5": {
    gradient: "from-chart-5 to-chart-5/80",
    button: "bg-chart-5 shadow-chart-5/20 hover:shadow-chart-5/40",
    badge: "bg-chart-5/20 text-chart-5",
  },
}

export function SiteCard({
  title,
  description,
  image,
  imageAlt,
  href,
  category,
  date,
  variant = "chart-1",
  className,
  children,
}: SiteCardProps) {
  const colors = variantColors[variant]

  const CardContent = (
    <div
      className={cn(
        "relative flex w-full flex-col rounded-xl bg-white text-gray-700 shadow-md",
        "transition-all duration-300 hover:shadow-xl",
        "group",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-4 -mt-6 aspect-square overflow-hidden rounded-xl bg-clip-border text-white shadow-lg",
          "transition-transform duration-500 ease-out group-hover:-translate-y-2",
          !image && "bg-gradient-to-r",
          !image && colors.gradient,
          image && "shadow-gray-500/40",
        )}
      >
        {image ? (
          <img
            src={image || "/placeholder.svg"}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-r", colors.gradient)} />
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Category/Date Badge */}
        {(category || date) && (
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", colors.badge)}>
                {category}
              </span>
            )}
            {date && <span className="text-xs text-gray-500 font-medium">{date}</span>}
          </div>
        )}

        {/* Title */}
        <h5
          className="mb-2 block text-xl font-bold leading-snug tracking-normal text-blue-gray-900 antialiased line-clamp-2"
          style={{ fontFamily: '"Crimson Text", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
        >
          {title}
        </h5>

        {/* Description */}
        {description && (
          <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased line-clamp-3">
            {description}
          </p>
        )}

        {/* Children */}
        {children}
      </div>

      {/* Read More Button */}
      {href && (
        <div className="p-6 pt-0">
          <button
            type="button"
            className={cn(
              "select-none rounded-full py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md transition-all hover:shadow-lg focus:opacity-85 focus:shadow-none active:opacity-85 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
              colors.button,
            )}
          >
            Lire plus
          </button>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}

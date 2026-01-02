export function getCategoryVariant(
  categoryName?: string,
): "primary" | "secondary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" {
  if (!categoryName) return "chart-1"

  // Create a consistent hash from the category name
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = (hash << 5) - hash + categoryName.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }

  // Map to one of the 5 chart colors (chart-1 to chart-5)
  const variants: ("chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5")[] = [
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
  ]
  const index = Math.abs(hash) % variants.length

  return variants[index]
}

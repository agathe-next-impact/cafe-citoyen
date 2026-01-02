import { type NextRequest, NextResponse } from "next/server"
import { getWordPressPageBySlug } from "@/lib/wordpress-api"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const page = await getWordPressPageBySlug(slug)

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] Error in page API route:", error)
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}

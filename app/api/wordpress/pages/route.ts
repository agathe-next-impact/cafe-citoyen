import { NextResponse } from "next/server"
import { getWordPressPages, organizePagesByParent } from "@/lib/wordpress-api"

export async function GET() {
  try {
    const pages = await getWordPressPages()
    const menuData = organizePagesByParent(pages)

    return NextResponse.json(menuData, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] API route error:", error)
    return NextResponse.json([])
  }
}

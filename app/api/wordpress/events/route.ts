import { NextResponse } from "next/server"
import { getWordPressEvents } from "@/lib/wordpress-api"

export async function GET() {
  try {
    const events = await getWordPressEvents()

    return NextResponse.json(events, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("[v0] Error in events API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    )
  }
}
import { NextRequest, NextResponse } from "next/server"

// Ce token doit être stocké dans une variable d'environnement NEXT_PUBLIC_PREVIEW_SECRET
const PREVIEW_SECRET = process.env.NEXT_PUBLIC_PREVIEW_SECRET

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  const slug = searchParams.get("slug")

  if (!secret || secret !== PREVIEW_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!slug) {
    return NextResponse.json({ message: "Missing slug" }, { status: 400 })
  }

  // Active le mode preview côté Next.js
  const res = NextResponse.redirect(`/${slug}`)
  res.cookies.set("__prv", "1", { path: "/", httpOnly: false })
  return res
}

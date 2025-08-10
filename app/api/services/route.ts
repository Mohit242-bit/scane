import { NextResponse } from "next/server"
import { services } from "@/lib/data"

export async function GET() {
  try {
    return NextResponse.json(services)
  } catch (error) {
    console.error("Services API error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

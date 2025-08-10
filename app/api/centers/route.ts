import { NextResponse } from "next/server"
import { centers, getCentersByService } from "@/lib/data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (serviceId) {
      const filteredCenters = getCentersByService(serviceId)
      return NextResponse.json(filteredCenters)
    }

    return NextResponse.json(centers)
  } catch (error) {
    console.error("Centers API error:", error)
    return NextResponse.json({ error: "Failed to fetch centers" }, { status: 500 })
  }
}

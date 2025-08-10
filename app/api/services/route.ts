import { type NextRequest, NextResponse } from "next/server"
import { services } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let filteredServices = services

    if (category && category !== "all") {
      filteredServices = filteredServices.filter((service) => service.category.toLowerCase() === category.toLowerCase())
    }

    if (search) {
      filteredServices = filteredServices.filter(
        (service) =>
          service.name.toLowerCase().includes(search.toLowerCase()) ||
          service.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return NextResponse.json(filteredServices)
  } catch (error) {
    console.error("Services API error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

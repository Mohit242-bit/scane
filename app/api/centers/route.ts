import { NextResponse } from "next/server"
import { centers } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get("serviceId")

  if (serviceId) {
    const filteredCenters = centers.filter((center) => center.services.includes(serviceId))
    return NextResponse.json(filteredCenters)
  }

  return NextResponse.json(centers)
}

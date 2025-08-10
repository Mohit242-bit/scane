import { type NextRequest, NextResponse } from "next/server"
import { seededSlotsFor, seededCentersFor } from "@/lib/data"
import { rankSlots } from "@/lib/slot-engine"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city") || "mumbai"
  const service = searchParams.get("service") || "mri-brain"
  const date = searchParams.get("date")

  try {
    const centers = seededCentersFor(city)
    let slots = seededSlotsFor(city, service)

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).getTime()
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).getTime()
      slots = slots.filter((slot) => slot.start_ts >= startOfDay && slot.start_ts <= endOfDay)
    }

    // Rank slots by optimization engine
    const rankedSlots = rankSlots(slots, centers)

    return NextResponse.json({
      slots: rankedSlots.slice(0, 20), // Limit to 20 slots
      centers: centers.filter((c) => rankedSlots.some((s) => s.center_id === c.id)),
    })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}

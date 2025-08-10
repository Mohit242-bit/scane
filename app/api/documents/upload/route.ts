import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { db, sql } from "@/lib/database"
import { notifications } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const bookingId = formData.get("bookingId") as string
    const type = formData.get("type") as "PRESCRIPTION" | "REPORT" | "INVOICE"
    const file = formData.get("file") as File

    if (!bookingId || !type || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and images are allowed." }, { status: 400 })
    }

    // Find booking
    const booking = await db.bookings.findById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate storage key
    const key = storage.generateKey(type.toLowerCase() as any, bookingId, file.name)

    // Upload to S3
    const url = await storage.uploadFile(key, buffer, file.type, {
      bookingId,
      type,
      uploadedBy: "partner", // or "user" based on context
    })

    // Save document record
    const document = await sql`
      INSERT INTO documents (booking_id, type, url, filename, size, uploaded_by)
      VALUES (${bookingId}, ${type}, ${url}, ${file.name}, ${file.size}, 'partner')
      RETURNING *
    `

    // If it's a report, notify the patient
    if (type === "REPORT") {
      const user = await sql`SELECT * FROM users WHERE id = ${booking.user_id} LIMIT 1`
      if (user[0]) {
        const downloadLink = await storage.getSignedDownloadUrl(key, 7 * 24 * 3600) // 7 days

        await notifications.sendNotification({
          userId: booking.user_id,
          bookingId,
          type: "report_ready",
          channels: ["whatsapp", "email"],
          content: {
            bookingId,
            patientName: user[0].name || "Patient",
            downloadLink,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      document: document[0],
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}

import { whatsapp } from "./whatsapp"
import { sms } from "./sms"
import { email } from "./email"
import { sql } from "./database"

interface NotificationData {
  userId: string
  bookingId: string
  type: string
  channels: ("whatsapp" | "sms" | "email")[]
  content: Record<string, any>
}

class NotificationService {
  async sendNotification(data: NotificationData): Promise<void> {
    // Get user details
    const user = await sql`SELECT * FROM users WHERE id = ${data.userId} LIMIT 1`
    if (!user[0]) {
      throw new Error("User not found")
    }

    const userDetails = user[0]

    // Send via each requested channel
    for (const channel of data.channels) {
      try {
        let success = false

        switch (channel) {
          case "whatsapp":
            success = await this.sendWhatsAppNotification(userDetails.phone, data.type, data.content)
            break
          case "sms":
            success = await this.sendSMSNotification(userDetails.phone, data.type, data.content)
            break
          case "email":
            if (userDetails.email) {
              success = await this.sendEmailNotification(userDetails.email, data.type, data.content)
            }
            break
        }

        // Log notification attempt
        await sql`
          INSERT INTO notifications (user_id, booking_id, type, channel, status, content, sent_at)
          VALUES (${data.userId}, ${data.bookingId}, ${data.type}, ${channel}, ${success ? "SENT" : "FAILED"}, ${JSON.stringify(data.content)}, ${success ? new Date() : null})
        `
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
      }
    }
  }

  private async sendWhatsAppNotification(phone: string, type: string, content: any): Promise<boolean> {
    switch (type) {
      case "otp":
        return whatsapp.sendOTP(phone, content.otp)
      case "booking_confirmation":
        return whatsapp.sendBookingConfirmation(phone, content)
      case "report_ready":
        return whatsapp.sendReportReady(phone, content.bookingId, content.downloadLink)
      case "appointment_reminder":
        return whatsapp.sendReminder(phone, content)
      default:
        return false
    }
  }

  private async sendSMSNotification(phone: string, type: string, content: any): Promise<boolean> {
    switch (type) {
      case "otp":
        return sms.sendOTP(phone, content.otp)
      case "booking_confirmation":
        return sms.sendBookingConfirmation(phone, content.bookingId)
      case "appointment_reminder":
        return sms.sendReminder(phone, content.serviceName, content.dateTime)
      default:
        return false
    }
  }

  private async sendEmailNotification(emailAddress: string, type: string, content: any): Promise<boolean> {
    switch (type) {
      case "booking_confirmation":
        return email.sendBookingConfirmation(emailAddress, content)
      case "report_ready":
        return email.sendReportReady(emailAddress, content.bookingId, content.patientName, content.downloadLink)
      default:
        return false
    }
  }

  async scheduleReminder(bookingId: string, reminderTime: Date): Promise<void> {
    // In production, use a job queue like Bull/BullMQ with Redis
    // For now, we'll use a simple setTimeout (not recommended for production)
    const delay = reminderTime.getTime() - Date.now()

    if (delay > 0) {
      setTimeout(async () => {
        try {
          const booking = await sql`
            SELECT b.*, u.phone, u.name, u.email, s.name as service_name, c.name as center_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN services s ON b.service_id = s.id
            JOIN centers c ON b.center_id = c.id
            WHERE b.id = ${bookingId}
          `

          if (booking[0]) {
            const bookingData = booking[0]
            await this.sendNotification({
              userId: bookingData.user_id,
              bookingId: bookingData.id,
              type: "appointment_reminder",
              channels: ["whatsapp", "sms"],
              content: {
                serviceName: bookingData.service_name,
                centerName: bookingData.center_name,
                dateTime: new Date(bookingData.created_at).toLocaleString(),
                prepInstructions: "Please arrive 15 minutes early and bring your ID.",
              },
            })
          }
        } catch (error) {
          console.error("Failed to send reminder:", error)
        }
      }, delay)
    }
  }
}

export const notifications = new NotificationService()

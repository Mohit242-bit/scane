import { whatsapp } from "./whatsapp"
import { sms } from "./sms"
import { email } from "./email"
// Using Supabase instead of direct SQL
import supabase from "./supabaseClient"

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
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.userId)
      .limit(1)
    
    if (error || !users || users.length === 0) {
      throw new Error("User not found")
    }
    
    const user = users[0]

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
        const { error: logError } = await supabase
          .from('notifications')
          .insert({
            user_id: data.userId,
            booking_id: data.bookingId,
            type: data.type,
            channel: channel,
            status: success ? "SENT" : "FAILED",
            content: data.content,
            sent_at: success ? new Date().toISOString() : null
          })
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
          const { data: bookingData, error } = await supabase
            .from('bookings')
            .select(`
              *,
              users!inner(phone, name, email),
              services!inner(name),
              centers!inner(name)
            `)
            .eq('id', bookingId)
            .single()

          if (!error && bookingData) {
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

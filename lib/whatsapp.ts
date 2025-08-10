import { config } from "./config"

interface WhatsAppMessage {
  to: string
  type: "template" | "text"
  template?: {
    name: string
    language: { code: string }
    components?: Array<{
      type: string
      parameters: Array<{ type: string; text: string }>
    }>
  }
  text?: {
    body: string
  }
}

class WhatsAppService {
  private baseUrl = "https://graph.facebook.com/v18.0"
  private token = config.communication.whatsapp.token
  private phoneNumberId = config.communication.whatsapp.phoneNumberId

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("WhatsApp API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("WhatsApp send error:", error)
      return false
    }
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      type: "template",
      template: {
        name: "otp_verification",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: otp },
              { type: "text", text: "10" }, // validity in minutes
            ],
          },
        ],
      },
    })
  }

  async sendBookingConfirmation(
    phone: string,
    bookingDetails: {
      bookingId: string
      serviceName: string
      centerName: string
      dateTime: string
      amount: number
    },
  ): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      type: "template",
      template: {
        name: "booking_confirmation",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: bookingDetails.bookingId },
              { type: "text", text: bookingDetails.serviceName },
              { type: "text", text: bookingDetails.centerName },
              { type: "text", text: bookingDetails.dateTime },
              { type: "text", text: `₹${bookingDetails.amount}` },
            ],
          },
        ],
      },
    })
  }

  async sendReportReady(phone: string, bookingId: string, downloadLink: string): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      type: "template",
      template: {
        name: "report_ready",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: bookingId },
              { type: "text", text: downloadLink },
            ],
          },
        ],
      },
    })
  }

  async sendReminder(
    phone: string,
    appointmentDetails: {
      serviceName: string
      centerName: string
      dateTime: string
      prepInstructions: string
    },
  ): Promise<boolean> {
    return this.sendMessage({
      to: phone,
      type: "template",
      template: {
        name: "appointment_reminder",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: appointmentDetails.serviceName },
              { type: "text", text: appointmentDetails.centerName },
              { type: "text", text: appointmentDetails.dateTime },
              { type: "text", text: appointmentDetails.prepInstructions },
            ],
          },
        ],
      },
    })
  }
}

export const whatsapp = new WhatsAppService()

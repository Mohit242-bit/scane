import { Resend } from "resend"
import { config } from "./config"

const resend = new Resend(config.communication.email.resendApiKey)

interface EmailTemplate {
  to: string
  subject: string
  html: string
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Mock email sending for development
      console.log("📧 Email would be sent:", {
        to: options.to,
        subject: options.subject,
        from: options.from || "noreply@scanezy.com",
      })

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100))

      return true
    } catch (error) {
      console.error("Email sending failed:", error)
      return false
    }
  }

  async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      bookingId: string
      patientName: string
      serviceName: string
      centerName: string
      dateTime: string
      amount: number
      prepInstructions: string
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation - ScanEzy</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #0B1B2B; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0AA1A7; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #F5F7FA; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #5B6B7A; font-size: 14px; }
            .button { background: #0AA1A7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed!</h1>
              <p>Your radiology appointment is all set</p>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.patientName},</p>
              <p>Your booking has been confirmed. Here are your appointment details:</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
                <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
                <p><strong>Center:</strong> ${bookingDetails.centerName}</p>
                <p><strong>Date & Time:</strong> ${bookingDetails.dateTime}</p>
                <p><strong>Amount Paid:</strong> ₹${bookingDetails.amount}</p>
              </div>

              <div class="booking-details">
                <h3>Preparation Instructions</h3>
                <p>${bookingDetails.prepInstructions}</p>
              </div>

              <p>Please arrive 15 minutes before your appointment time.</p>
              
              <p style="text-align: center;">
                <a href="https://scanezy.com/booking/${bookingDetails.bookingId}" class="button">
                  View Booking Details
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@scanezy.com or call 1800-SCANEZY</p>
              <p>© 2024 ScanEzy. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed - ${bookingDetails.serviceName} | ScanEzy`,
      html,
    })
  }

  async sendReportReady(email: string, bookingId: string, patientName: string, downloadLink: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Report Ready - ScanEzy</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #0B1B2B; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #B7F171; color: #0B1B2B; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #F5F7FA; }
            .button { background: #0AA1A7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { text-align: center; padding: 20px; color: #5B6B7A; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Report is Ready!</h1>
              <p>Download your radiology report</p>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your radiology report for booking <strong>${bookingId}</strong> is now ready for download.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${downloadLink}" class="button">
                  Download Report
                </a>
              </p>

              <p><strong>Important:</strong></p>
              <ul>
                <li>Please consult with your doctor to understand the results</li>
                <li>Keep this report safe for future reference</li>
                <li>Contact us if you have any questions about the report</li>
              </ul>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@scanezy.com or call 1800-SCANEZY</p>
              <p>© 2024 ScanEzy. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Report Ready - Booking ${bookingId} | ScanEzy`,
      html,
    })
  }
}

export const email = new EmailService()

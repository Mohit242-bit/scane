import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimiter } from "@/lib/rate-limit"
import { email } from "@/lib/email"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
    .optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  inquiryType: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"

    // Rate limiting - 5 messages per hour per IP
    const { allowed, remaining, resetTime } = await rateLimiter.checkLimit(ip, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
      keyGenerator: (ip) => `contact_limit:${ip}`,
    })

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetTime.toString(),
          },
        },
      )
    }

    const body = await req.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid form data", details: validation.error.errors }, { status: 400 })
    }

    const { name, email: userEmail, phone, subject, message, inquiryType } = validation.data

    // Send notification email to support team
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #0B1B2B; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #F8FAFC; }
            .field { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
            .label { font-weight: bold; color: #0B1B2B; }
            .value { margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
              <p>${inquiryType || "General Inquiry"}</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${userEmail}</div>
              </div>
              ${
                phone
                  ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">+91 ${phone}</div>
              </div>
              `
                  : ""
              }
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, "<br>")}</div>
              </div>
              <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    await email.sendEmail({
      to: "support@scanezy.com",
      subject: `[ScanEzy] ${subject} from ${name}`,
      html: emailHtml,
    })

    // Send confirmation email to user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Message Received - ScanEzy</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #0B1B2B; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #F8FAFC; }
            .footer { text-align: center; padding: 20px; color: #64748B; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting ScanEzy!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>We've received your message and will respond within 24 hours.</p>
              <p><strong>Your message:</strong></p>
              <p style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                ${message.replace(/\n/g, "<br>")}
              </p>
              <p>If you have any urgent concerns, please call us at <strong>1800-SCANEZY</strong>.</p>
              <p>Best regards,<br>The ScanEzy Team</p>
            </div>
            <div class="footer">
              <p>© 2024 ScanEzy. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await email.sendEmail({
      to: userEmail,
      subject: "Message Received - ScanEzy Support",
      html: confirmationHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully. We'll respond within 24 hours.",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}

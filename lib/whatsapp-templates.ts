import { config } from "./config";

interface WhatsAppTemplate {
  name: string
  language: { code: string }
  components?: Array<{
    type: string
    parameters: Array<{ type: string; text: string }>
  }>
}

class WhatsAppTemplateService {
  private baseUrl = "https://graph.facebook.com/v18.0";
  private token = config.communication.whatsapp.token;
  private phoneNumberId = config.communication.whatsapp.phoneNumberId;

  async sendTemplateMessage(to: string, template: WhatsAppTemplate): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${to}`, // Add country code
          type: "template",
          template,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("WhatsApp template error:", error);
        return false;
      }

      const result = await response.json();
      console.log("WhatsApp message sent:", result);
      return true;
    } catch (error) {
      console.error("WhatsApp send error:", error);
      return false;
    }
  }

  async sendOTPTemplate(phone: string, otp: string): Promise<boolean> {
    return this.sendTemplateMessage(phone, {
      name: "otp_verification_scanezy",
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
    });
  }

  async sendBookingConfirmationTemplate(
    phone: string,
    details: {
      bookingId: string
      serviceName: string
      centerName: string
      dateTime: string
      amount: string
    },
  ): Promise<boolean> {
    return this.sendTemplateMessage(phone, {
      name: "booking_confirmation_scanezy",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: details.bookingId },
            { type: "text", text: details.serviceName },
            { type: "text", text: details.centerName },
            { type: "text", text: details.dateTime },
            { type: "text", text: details.amount },
          ],
        },
      ],
    });
  }

  async sendReportReadyTemplate(phone: string, bookingId: string): Promise<boolean> {
    return this.sendTemplateMessage(phone, {
      name: "report_ready_scanezy",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: bookingId }],
        },
      ],
    });
  }

  async sendReminderTemplate(
    phone: string,
    details: {
      serviceName: string
      centerName: string
      dateTime: string
    },
  ): Promise<boolean> {
    return this.sendTemplateMessage(phone, {
      name: "appointment_reminder_scanezy",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: details.serviceName },
            { type: "text", text: details.centerName },
            { type: "text", text: details.dateTime },
          ],
        },
      ],
    });
  }

  // Create templates via API (run once during setup)
  async createTemplates(): Promise<void> {
    const templates = [
      {
        name: "otp_verification_scanezy",
        category: "AUTHENTICATION",
        language: "en",
        components: [
          {
            type: "BODY",
            text: "Your ScanEzy OTP is: {{1}}. Valid for {{2}} minutes. Do not share this code with anyone.",
          },
        ],
      },
      {
        name: "booking_confirmation_scanezy",
        category: "UTILITY",
        language: "en",
        components: [
          {
            type: "BODY",
            text: "🎉 Booking Confirmed!\n\nBooking ID: {{1}}\nService: {{2}}\nCenter: {{3}}\nDate & Time: {{4}}\nAmount: ₹{{5}}\n\nPlease arrive 15 minutes early. Bring your ID and prescription.",
          },
        ],
      },
      {
        name: "report_ready_scanezy",
        category: "UTILITY",
        language: "en",
        components: [
          {
            type: "BODY",
            text: "📋 Your report is ready!\n\nBooking ID: {{1}}\n\nYou can download your report from the ScanEzy app or website. Please consult with your doctor to understand the results.",
          },
        ],
      },
      {
        name: "appointment_reminder_scanezy",
        category: "UTILITY",
        language: "en",
        components: [
          {
            type: "BODY",
            text: "⏰ Appointment Reminder\n\nService: {{1}}\nCenter: {{2}}\nTomorrow at {{3}}\n\nPlease arrive 15 minutes early and bring your ID. Contact us if you need to reschedule.",
          },
        ],
      },
    ];

    for (const template of templates) {
      try {
        const response = await fetch(
          `${this.baseUrl}/${config.communication.whatsapp.phoneNumberId}/message_templates`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(template),
          },
        );

        if (response.ok) {
          console.log(`✅ Template ${template.name} created successfully`);
        } else {
          const error = await response.json();
          console.error(`❌ Failed to create template ${template.name}:`, error);
        }
      } catch (error) {
        console.error(`❌ Error creating template ${template.name}:`, error);
      }
    }
  }
}

export const whatsappTemplates = new WhatsAppTemplateService();

import { Twilio } from "twilio";
import { config } from "./config";

class SMSService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(config.communication.twilio.accountSid, config.communication.twilio.authToken);
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: `Your ScanEzy OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: config.communication.twilio.phoneNumber,
        to: `+91${phone}`,
      });
      return true;
    } catch (error) {
      console.error("SMS send error:", error);
      return false;
    }
  }

  async sendBookingConfirmation(phone: string, bookingId: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: `Your ScanEzy booking ${bookingId} is confirmed! Check WhatsApp for details. Support: 1800-SCANEZY`,
        from: config.communication.twilio.phoneNumber,
        to: `+91${phone}`,
      });
      return true;
    } catch (error) {
      console.error("SMS send error:", error);
      return false;
    }
  }

  async sendReminder(phone: string, serviceName: string, dateTime: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: `Reminder: Your ${serviceName} appointment is tomorrow at ${dateTime}. Please arrive 15 minutes early.`,
        from: config.communication.twilio.phoneNumber,
        to: `+91${phone}`,
      });
      return true;
    } catch (error) {
      console.error("SMS send error:", error);
      return false;
    }
  }
}

export const sms = new SMSService();

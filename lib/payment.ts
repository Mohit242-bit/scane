import Razorpay from "razorpay"
import { config } from "./config"
import crypto from "crypto"

class PaymentService {
  private razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.payment.razorpay.keyId,
      key_secret: config.payment.razorpay.keySecret,
    })
  }

  async createOrder(
    amount: number,
    bookingId: string,
  ): Promise<{
    id: string
    amount: number
    currency: string
  }> {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: bookingId,
        notes: {
          booking_id: bookingId,
        },
      })

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      }
    } catch (error) {
      console.error("Razorpay order creation error:", error)
      throw new Error("Failed to create payment order")
    }
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean {
    try {
      const body = razorpayOrderId + "|" + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac("sha256", config.payment.razorpay.keySecret)
        .update(body.toString())
        .digest("hex")

      return expectedSignature === razorpaySignature
    } catch (error) {
      console.error("Payment verification error:", error)
      return false
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId)
    } catch (error) {
      console.error("Failed to fetch payment details:", error)
      throw new Error("Failed to fetch payment details")
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : undefined, // Convert to paise if partial refund
      })
      return refund
    } catch (error) {
      console.error("Refund error:", error)
      throw new Error("Failed to process refund")
    }
  }
}

export const payment = new PaymentService()

/**
 * Payment Service
 * Handles Razorpay payment operations including order creation, verification, and refunds
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "./config";
import { logger } from "./logger";

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
}

interface PaymentVerification {
  orderId: string
  paymentId: string
  signature: string
}

interface RefundOptions {
  paymentId: string
  amount?: number
  reason?: string
}

class PaymentService {
  private razorpay: Razorpay;
  private readonly logger = logger;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.payment.razorpay.keyId as string,
      key_secret: config.payment.razorpay.keySecret as string,
    });
  }

  /**
   * Creates a new Razorpay order
   * @param amount - Amount in rupees (will be converted to paise)
   * @param bookingId - Booking ID for reference
   * @returns Razorpay order details
   */
  async createOrder(amount: number, bookingId: string): Promise<RazorpayOrder> {
    try {
      this.logger.info("Creating Razorpay order", {
        amount,
        bookingId,
        amountInPaise: amount * 100,
      });

      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: bookingId,
        notes: {
          booking_id: bookingId,
        },
      });

      this.logger.info("Razorpay order created successfully", {
        orderId: order.id,
        bookingId,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch (error) {
      this.logger.error("Failed to create Razorpay order", error, {
        amount,
        bookingId,
      });
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Verifies Razorpay payment signature
   * @param verification - Payment verification details
   * @returns true if signature is valid
   */
  verifyPayment(verification: PaymentVerification): boolean {
    try {
      const { orderId, paymentId, signature } = verification;
      
      this.logger.debug("Verifying payment signature", {
        orderId,
        paymentId,
      });

      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", config.payment.razorpay.keySecret)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === signature;

      if (isValid) {
        this.logger.info("Payment signature verified successfully", {
          orderId,
          paymentId,
        });
      } else {
        this.logger.warn("Payment signature verification failed", {
          orderId,
          paymentId,
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error("Payment verification error", error, {
        orderId: verification.orderId,
        paymentId: verification.paymentId,
      });
      return false;
    }
  }

  /**
   * Fetches payment details from Razorpay
   * @param paymentId - Razorpay payment ID
   * @returns Payment details
   */
  async getPaymentDetails(paymentId: string): Promise<unknown> {
    try {
      this.logger.debug("Fetching payment details", { paymentId });
      
      const payment = await this.razorpay.payments.fetch(paymentId);
      
      this.logger.info("Payment details fetched successfully", { paymentId });
      
      return payment;
    } catch (error) {
      this.logger.error("Failed to fetch payment details", error, { paymentId });
      throw new Error("Failed to fetch payment details");
    }
  }

  /**
   * Processes a refund for a payment
   * @param options - Refund options including payment ID and amount
   * @returns Refund details
   */
  async refundPayment(options: RefundOptions): Promise<unknown> {
    try {
      const { paymentId, amount, reason } = options;
      
      this.logger.info("Processing refund", {
        paymentId,
        amount,
        reason,
        isPartial: Boolean(amount),
      });

      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : undefined, // Convert to paise if partial refund
        notes: reason ? { reason } : undefined,
      });

      this.logger.info("Refund processed successfully", {
        paymentId,
        refundId: refund.id,
        amount: refund.amount,
      });

      return refund;
    } catch (error) {
      this.logger.error("Refund processing failed", error, {
        paymentId: options.paymentId,
        amount: options.amount,
        reason: options.reason,
      });
      throw new Error("Failed to process refund");
    }
  }
}

export const payment = new PaymentService();


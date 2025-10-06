import { z } from "zod";

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number");

export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be 6 digits");

export const emailSchema = z.string().email("Please enter a valid email address");

export const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  centerId: z.string().min(1, "Center is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  patientName: nameSchema,
  patientAge: z.number().min(1).max(120),
  patientGender: z.enum(["male", "female", "other"]),
  patientPhone: phoneSchema,
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.enum(["general", "booking", "technical", "partnership", "feedback"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

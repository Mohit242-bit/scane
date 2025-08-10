import { z } from "zod"

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")

export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers")

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  centerId: z.string().min(1, "Center is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  patientName: z.string().min(2, "Patient name must be at least 2 characters"),
  patientAge: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  patientGender: z.enum(["male", "female", "other"]),
  patientPhone: z.string().min(10, "Phone number is required"),
})

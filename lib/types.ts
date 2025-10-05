/**
 * Core Type Definitions
 * Centralized type definitions used across the application
 */

/**
 * Represents a medical service/test that can be booked
 */
export interface Service {
  id: string
  name: string
  description: string
  price: number
  /** Duration in minutes */
  duration: number
  category: string
  preparation?: string
  fasting_required?: boolean
}

/**
 * Represents a diagnostic center/facility
 */
export interface Center {
  id: string
  name: string
  address: string
  city: string
  phone: string
  /** Rating out of 5 */
  rating: number
  /** Array of service IDs offered by this center */
  services: string[]
  /** Operating hours description */
  timings: string
  /** Area/locality hint for better search */
  area_hint: string
}

/**
 * Booking status types
 */
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/**
 * Gender options
 */
export type Gender = 'male' | 'female' | 'other'

/**
 * Represents a booking/appointment
 */
export interface Booking {
  id: string
  serviceId: string
  centerId: string
  date: string
  time: string
  status: BookingStatus
  paymentStatus?: PaymentStatus
  patientName: string
  patientAge: number
  patientGender: Gender
  patientPhone: string
  patientEmail?: string
  notes?: string
  totalAmount: number
  /** ISO 8601 datetime string */
  createdAt: string
  /** ISO 8601 datetime string */
  updatedAt: string
}

/**
 * Time slot status
 */
export type SlotStatus = 'OPEN' | 'BOOKED' | 'BLOCKED'

/**
 * Represents an available time slot for booking
 */
export interface Slot {
  id: string
  center_id: string
  service_id: string
  /** Unix timestamp for slot start */
  start_ts: number
  /** Unix timestamp for slot end */
  end_ts: number
  status: SlotStatus
  /** Source of the slot (e.g., 'SEED', 'MANUAL', 'API') */
  source: string
  price: number
  /** Turnaround time in hours for report delivery */
  tat_hours: number
}

/**
 * User roles in the system
 */
export type UserRole = 'customer' | 'partner' | 'admin'

/**
 * Represents a user in the system
 */
export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  role?: UserRole
  /** ISO 8601 datetime string */
  createdAt: string
}

/**
 * Extended user profile with additional details
 */
export interface UserProfile extends User {
  avatar_url?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

/**
 * Partner/Center owner information
 */
export interface Partner {
  id: string
  user_id: string
  business_name: string
  registration_number?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  verified: boolean
  created_at: string
  updated_at: string
}

/**
 * Review for a booking
 */
export interface Review {
  id: string
  booking_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
}

/**
 * Document types
 */
export type DocumentType = 'PRESCRIPTION' | 'REPORT' | 'INVOICE' | 'ID_PROOF'

/**
 * Uploaded document information
 */
export interface Document {
  id: string
  booking_id: string
  type: DocumentType
  url: string
  filename: string
  size: number
  uploaded_by: string
  uploaded_at: string
}

/**
 * Location coordinates
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * City information
 */
export interface City {
  name: string
  slug: string
  state: string
  coordinates?: Coordinates
}

/**
 * API response wrapper for successful responses
 */
export interface ApiResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

/**
 * API response wrapper for error responses
 */
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode?: number
    fields?: Record<string, string>
  }
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}


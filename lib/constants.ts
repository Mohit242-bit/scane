/**
 * Application Constants
 * Centralized constants to avoid magic strings and numbers throughout the codebase
 */

/**
 * Booking related constants
 */
export const BOOKING = {
  /** Time in minutes before booking holds expire */
  HOLD_DURATION_MINUTES: 7,
  /** Minimum age for booking */
  MIN_AGE: 1,
  /** Maximum age for booking */
  MAX_AGE: 120,
  /** Maximum notes length */
  MAX_NOTES_LENGTH: 500,
} as const

/**
 * Payment related constants
 */
export const PAYMENT = {
  /** Currency code */
  CURRENCY: 'INR',
  /** Conversion factor for paise to rupees */
  PAISE_TO_RUPEES: 100,
  /** Default payment timeout in milliseconds */
  TIMEOUT_MS: 30000,
} as const

/**
 * User roles
 */
export const ROLES = {
  CUSTOMER: 'customer',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const

/**
 * Booking statuses
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

/**
 * Payment statuses
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

/**
 * Slot statuses
 */
export const SLOT_STATUS = {
  OPEN: 'OPEN',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
} as const

/**
 * Document types
 */
export const DOCUMENT_TYPES = {
  PRESCRIPTION: 'PRESCRIPTION',
  REPORT: 'REPORT',
  INVOICE: 'INVOICE',
  ID_PROOF: 'ID_PROOF',
} as const

/**
 * API error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  /** Allowed file types for prescriptions */
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  /** Maximum number of files per upload */
  MAX_FILES: 5,
} as const

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
  /** Short cache - 5 minutes */
  SHORT: 5 * 60,
  /** Medium cache - 15 minutes */
  MEDIUM: 15 * 60,
  /** Long cache - 1 hour */
  LONG: 60 * 60,
  /** Very long cache - 24 hours */
  VERY_LONG: 24 * 60 * 60,
} as const

/**
 * Rate limiting
 */
export const RATE_LIMIT = {
  /** Default window in seconds */
  WINDOW_SECONDS: 60,
  /** Default max requests per window */
  MAX_REQUESTS: 60,
  /** Strict limit for sensitive operations */
  STRICT_MAX_REQUESTS: 10,
} as const

/**
 * App metadata
 */
export const APP = {
  NAME: 'ScanEzy',
  DESCRIPTION: 'Fast, convenient, and reliable diagnostic services',
  SUPPORT_EMAIL: 'support@scanezy.com',
  SUPPORT_PHONE: '+91-1800-123-4567',
} as const

/**
 * Date/Time formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME: 'HH:mm',
  TIME_12H: 'hh:mm a',
} as const

/**
 * Validation patterns
 */
export const VALIDATION = {
  /** Indian phone number pattern */
  PHONE_REGEX: /^[6-9]\d{9}$/,
  /** Email pattern */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Indian PIN code pattern */
  PINCODE_REGEX: /^[1-9][0-9]{5}$/,
} as const

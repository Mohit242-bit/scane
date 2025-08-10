import type { Booking } from "./types"

type Review = {
  id: string
  booking_id: string
  rating: number
  comment: string
  created_ts: number
}

type Document = {
  id: string
  booking_id: string
  type: "PRESCRIPTION" | "REPORT" | "INVOICE"
  url: string
  filename: string
  size: number
  uploaded_by: string
  uploaded_ts: number
}

type DB = {
  bookings: Booking[]
  reviews: Review[]
  documents: Document[]
  heldSlots: Map<string, { bookingId: string; expiresAt: number }>
}

const memoryDB: DB = (globalThis as any).__db || {
  bookings: [],
  reviews: [],
  documents: [],
  heldSlots: new Map(),
}
;(globalThis as any).__db = memoryDB

export const db = memoryDB

export function getBookingById(id: string) {
  return db.bookings.find((b) => b.id === id) || null
}

export function getReviewsByBookingId(bookingId: string) {
  return db.reviews.filter((r) => r.booking_id === bookingId)
}

export function getDocumentsByBookingId(bookingId: string) {
  return db.documents.filter((d) => d.booking_id === bookingId)
}

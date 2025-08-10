import type { Booking } from "./types"

// Mock database implementation for development
export interface User {
  id: string
  phone?: string
  email?: string
  name: string
  createdAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  preparation?: string
}

export interface Center {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  services: string[]
  coordinates: { lat: number; lng: number }
}

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

export function getBookingById(id: string): Booking | null {
  return db.bookings.find((b) => b.id === id) || null
}

export function getReviewsByBookingId(bookingId: string) {
  return db.reviews.filter((r) => r.booking_id === bookingId)
}

export function getDocumentsByBookingId(bookingId: string) {
  return db.documents.filter((d) => d.booking_id === bookingId)
}

// Mock Redis interface - required for rate limiting
export const redis = {
  get: async (key: string) => null,
  set: async (key: string, value: string, options?: any) => "OK",
  del: async (key: string) => 1,
  exists: async (key: string) => 0,
  incr: async (key: string) => 1,
  expire: async (key: string, seconds: number) => 1,
}

// In-memory storage
const users: User[] = []
const services: Service[] = [
  {
    id: "1",
    name: "X-Ray Chest",
    description: "Digital chest X-ray examination",
    price: 500,
    duration: 15,
    category: "X-Ray",
    preparation: "Remove all metal objects",
  },
  {
    id: "2",
    name: "MRI Brain",
    description: "Magnetic Resonance Imaging of the brain",
    price: 8000,
    duration: 45,
    category: "MRI",
    preparation: "No metal objects, inform about implants",
  },
  {
    id: "3",
    name: "CT Scan Abdomen",
    description: "Computed Tomography scan of abdomen",
    price: 3500,
    duration: 30,
    category: "CT Scan",
    preparation: "Fasting for 6 hours before scan",
  },
  {
    id: "4",
    name: "Ultrasound Abdomen",
    description: "Abdominal ultrasound examination",
    price: 1200,
    duration: 20,
    category: "Ultrasound",
    preparation: "Fasting for 8 hours, drink water 1 hour before",
  },
]

const centers: Center[] = [
  {
    id: "1",
    name: "Apollo Diagnostics",
    address: "123 MG Road, Bangalore",
    phone: "+91 80 1234 5678",
    rating: 4.5,
    services: ["1", "2", "3", "4"],
    coordinates: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: "2",
    name: "Manipal Imaging Center",
    address: "456 Brigade Road, Bangalore",
    phone: "+91 80 2345 6789",
    rating: 4.3,
    services: ["1", "3", "4"],
    coordinates: { lat: 12.9698, lng: 77.6205 },
  },
  {
    id: "3",
    name: "Narayana Health Diagnostics",
    address: "789 Whitefield, Bangalore",
    phone: "+91 80 3456 7890",
    rating: 4.7,
    services: ["1", "2", "3", "4"],
    coordinates: { lat: 12.9698, lng: 77.75 },
  },
]

// Mock database operations
export const databaseOperations = {
  users: {
    findByPhone: async (phone: string): Promise<User | null> => {
      return users.find((u) => u.phone === phone) || null
    },
    findByEmail: async (email: string): Promise<User | null> => {
      return users.find((u) => u.email === email) || null
    },
    findById: async (id: string): Promise<User | null> => {
      return users.find((u) => u.id === id) || null
    },
    create: async (data: Omit<User, "id" | "createdAt">): Promise<User> => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date(),
      }
      users.push(user)
      return user
    },
  },
  services: {
    findAll: async (): Promise<Service[]> => services,
    findById: async (id: string): Promise<Service | null> => {
      return services.find((s) => s.id === id) || null
    },
    findByCategory: async (category: string): Promise<Service[]> => {
      return services.filter((s) => s.category === category)
    },
  },
  centers: {
    findAll: async (): Promise<Center[]> => centers,
    findById: async (id: string): Promise<Center | null> => {
      return centers.find((c) => c.id === id) || null
    },
    findByService: async (serviceId: string): Promise<Center[]> => {
      return centers.filter((c) => c.services.includes(serviceId))
    },
  },
  bookings: {
    findAll: async (): Promise<Booking[]> => db.bookings,
    findById: async (id: string): Promise<Booking | null> => {
      return getBookingById(id)
    },
    findByUserId: async (userId: string): Promise<Booking[]> => {
      return db.bookings.filter((b) => b.serviceId === userId) // Note: using serviceId as fallback since no userId
    },
    create: async (data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> => {
      const booking: Booking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      db.bookings.push(booking)
      return booking
    },
    update: async (id: string, data: Partial<Booking>): Promise<Booking | null> => {
      const index = db.bookings.findIndex((b) => b.id === id)
      if (index === -1) return null
      db.bookings[index] = {
        ...db.bookings[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return db.bookings[index]
    },
  },
  reviews: {
    create: async (data: Omit<Review, "id" | "created_ts">): Promise<Review> => {
      const review: Review = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        created_ts: Date.now(),
      }
      db.reviews.push(review)
      return review
    },
  },
  documents: {
    create: async (data: Omit<Document, "id" | "uploaded_ts">): Promise<Document> => {
      const document: Document = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        uploaded_ts: Date.now(),
      }
      db.documents.push(document)
      return document
    },
  },
  heldSlots: {
    create: async (slotId: string, bookingId: string, expiresAt: number): Promise<void> => {
      db.heldSlots.set(slotId, { bookingId, expiresAt })
    },
    delete: async (slotId: string): Promise<void> => {
      db.heldSlots.delete(slotId)
    },
    find: async (slotId: string): Promise<{ bookingId: string; expiresAt: number } | undefined> => {
      return db.heldSlots.get(slotId)
    },
  },
}

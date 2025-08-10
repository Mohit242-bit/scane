export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  preparation?: string
  fasting_required?: boolean
}

export interface Center {
  id: string
  name: string
  address: string
  city: string
  phone: string
  rating: number
  services: string[]
  timings: string
  area_hint: string
}

export interface Booking {
  id: string
  serviceId: string
  centerId: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  patientName: string
  patientAge: number
  patientGender: "male" | "female" | "other"
  patientPhone: string
  patientEmail?: string
  notes?: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  id: string
  centerId: string
  date: string
  time: string
  available: boolean
  serviceId?: string
}

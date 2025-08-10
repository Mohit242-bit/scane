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
  status: "confirmed" | "pending" | "cancelled"
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

export interface Slot {
  id: string
  center_id: string
  service_id: string
  start_ts: number
  end_ts: number
  status: "OPEN" | "BOOKED" | "BLOCKED"
  source: string
  price: number
  tat_hours: number
}

export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  createdAt: string
}

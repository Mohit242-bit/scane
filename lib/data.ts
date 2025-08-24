import type { Service, Center } from "./types"

export const services: Service[] = [
  {
    id: "mri-brain",
    name: "MRI Brain",
    description: "Detailed brain imaging using magnetic resonance technology",
    price: 8000,
    duration: 45,
    category: "MRI",
    preparation: "Remove all metal objects, inform about implants",
    fasting_required: false,
  },
  {
    id: "ct-chest",
    name: "CT Chest",
    description: "High-resolution chest imaging for lung and heart evaluation",
    price: 4500,
    duration: 15,
    category: "CT Scan",
    preparation: "No special preparation required",
    fasting_required: false,
  },
  {
    id: "xray-chest",
    name: "X-Ray Chest",
    description: "Basic chest X-ray for lung and heart screening",
    price: 800,
    duration: 10,
    category: "X-Ray",
    preparation: "Remove jewelry and metal objects from chest area",
    fasting_required: false,
  },
  {
    id: "ultrasound-abdomen",
    name: "Ultrasound Abdomen",
    description: "Abdominal ultrasound for organ evaluation",
    price: 2500,
    duration: 30,
    category: "Ultrasound",
    preparation: "6 hours fasting required",
    fasting_required: true,
  },
  {
    id: "mammography",
    name: "Mammography",
    description: "Breast cancer screening and diagnostic imaging",
    price: 3500,
    duration: 20,
    category: "Mammography",
    preparation: "Avoid deodorants and powders",
    fasting_required: false,
  },
  {
    id: "bone-density",
    name: "Bone Density Scan",
    description: "DEXA scan for osteoporosis screening",
    price: 3000,
    duration: 30,
    category: "DEXA",
    preparation: "Avoid calcium supplements 24 hours before",
    fasting_required: false,
  },
]

export const centers: Center[] = [
  {
    id: "apollo-diagnostics",
    name: "Apollo Diagnostics",
    address: "123 MG Road, Bangalore",
    city: "Bangalore",
    phone: "+91-80-12345678",
    rating: 4.8,
    services: ["mri-brain", "ct-chest", "xray-chest", "ultrasound-abdomen"],
    timings: "Mon-Sat: 8:00 AM - 8:00 PM, Sun: 9:00 AM - 5:00 PM",
    area_hint: "Near Cubbon Park Metro Station",
  },
  {
    id: "max-diagnostics",
    name: "Max Healthcare Diagnostics",
    address: "456 Whitefield Road, Bangalore",
    city: "Bangalore",
    phone: "+91-80-87654321",
    rating: 4.6,
    services: ["mri-brain", "ct-chest", "mammography", "bone-density"],
    timings: "Mon-Sun: 7:00 AM - 9:00 PM",
    area_hint: "Whitefield IT Hub Area",
  },
  {
    id: "fortis-diagnostics",
    name: "Fortis Diagnostics",
    address: "789 Koramangala, Bangalore",
    city: "Bangalore",
    phone: "+91-80-11223344",
    rating: 4.7,
    services: ["ct-chest", "xray-chest", "ultrasound-abdomen", "mammography"],
    timings: "Mon-Sat: 8:30 AM - 7:30 PM",
    area_hint: "Koramangala 5th Block",
  },
  {
    id: "medanta-diagnostics",
    name: "Medanta Diagnostics",
    address: "321 HSR Layout, Bangalore",
    city: "Bangalore",
    phone: "+91-80-99887766",
    rating: 4.5,
    services: ["mri-brain", "xray-chest", "ultrasound-abdomen", "bone-density"],
    timings: "Mon-Sun: 8:00 AM - 8:00 PM",
    area_hint: "HSR Layout Sector 1",
  },
]

// Helper functions
export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id)
}

export function getCenterById(id: string): Center | undefined {
  return centers.find((center) => center.id === id)
}

export function getCentersByService(serviceId: string): Center[] {
  return centers.filter((center) => center.services.includes(serviceId))
}

export function getServicesByCategory(category: string): Service[] {
  return services.filter((service) => service.category === category)
}

// City data for booking flow
export function citiesSeed() {
  return [
    { slug: "mumbai", name: "Mumbai", state: "Maharashtra" },
    { slug: "delhi", name: "Delhi", state: "Delhi" },
    { slug: "bangalore", name: "Bangalore", state: "Karnataka" },
    { slug: "chennai", name: "Chennai", state: "Tamil Nadu" },
    { slug: "hyderabad", name: "Hyderabad", state: "Telangana" },
    { slug: "pune", name: "Pune", state: "Maharashtra" },
  ]
}

// Get centers for a specific city
export function seededCentersFor(citySlug: string): Center[] {
  const cityName = citiesSeed().find((c) => c.slug === citySlug)?.name
  if (!cityName) return []
  
  return centers.filter((center) => center.city === cityName)
}

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

if (!SERVICE_ROLE) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (required for server-side seeding)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

async function main() {
  console.log('Seeding Supabase with sample services and centers...')

  const services = [
    { name: 'MRI Brain', description: 'Magnetic resonance imaging of the brain', modality: 'MRI', price: 2500 },
    { name: 'X-Ray Chest', description: 'Chest radiograph', modality: 'XRAY', price: 300 },
    { name: 'CT Head', description: 'CT scan of the head', modality: 'CT', price: 1800 },
  ]

  const { data: servicesData, error: servicesError } = await supabase.from('services').insert(services).select()
  if (servicesError) {
    console.error('Error inserting services:', servicesError)
  } else {
    console.log(`Inserted ${servicesData?.length ?? 0} services`)
  }

  const centers = [
    { name: 'City Diagnostics - Bandra', city: 'Mumbai', area_hint: 'Bandra West', rating: 4.6 },
    { name: 'Metro Imaging - Andheri', city: 'Mumbai', area_hint: 'Andheri East', rating: 4.4 },
    { name: 'Central Labs - Pune', city: 'Pune', area_hint: 'Deccan', rating: 4.7 },
  ]

  const { data: centersData, error: centersError } = await supabase.from('centers').insert(centers).select()
  if (centersError) {
    console.error('Error inserting centers:', centersError)
  } else {
    console.log(`Inserted ${centersData?.length ?? 0} centers`)
  }

  // Insert a sample booking using the first service/center (if present)
  if (servicesData && centersData && servicesData.length > 0 && centersData.length > 0) {
    const booking = {
      service_id: servicesData[0].id,
      center_id: centersData[0].id,
      patient_name: 'Seed Patient',
      patient_email: 'seed@example.com',
      patient_phone: '9999999999',
      appointment: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      payment_status: 'pending',
    }

    const { data: bookingData, error: bookingError } = await supabase.from('bookings').insert([booking]).select()
    if (bookingError) {
      console.error('Error inserting booking:', bookingError)
    } else {
      console.log('Inserted booking:', bookingData)
    }
  }

  // Final counts
  const { data: finalServices } = await supabase.from('services').select('*')
  const { data: finalCenters } = await supabase.from('centers').select('*')
  const { data: finalBookings } = await supabase.from('bookings').select('*')

  console.log('Final counts -> services:', finalServices?.length ?? 0, 'centers:', finalCenters?.length ?? 0, 'bookings:', finalBookings?.length ?? 0)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})

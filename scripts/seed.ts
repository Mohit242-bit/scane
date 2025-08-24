import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // First, insert sample users
    console.log('Creating users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          id: 1,
          email: 'admin@medezy.com',
          full_name: 'Admin User',
          role: 'admin',
          auth_provider: 'email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'partner@example.com',
          full_name: 'Partner User',
          role: 'partner',
          auth_provider: 'email',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          email: 'john.doe@example.com',
          full_name: 'John Doe',
          phone: '+919876543210',
          role: 'customer',
          auth_provider: 'phone',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (usersError) throw usersError
    console.log('✅ Users created')

    // Create partners
    console.log('Creating partners...')
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .upsert([
        {
          id: 1,
          user_id: 2,
          business_name: 'City Medical Center',
          business_email: 'contact@citymedical.com',
          business_phone: '+919876543211',
          city: 'Mumbai',
          address: '123 Medical Street, Andheri, Mumbai',
          status: 'approved',
          business_registration: 'REG123456',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (partnersError) throw partnersError
    console.log('✅ Partners created')

    // Create centers
    console.log('Creating centers...')
    const { data: centers, error: centersError } = await supabase
      .from('centers')
      .upsert([
        {
          id: 1,
          partner_id: 1,
          name: 'City Medical Andheri',
          address: '123 Medical Street, Andheri West, Mumbai',
          city: 'Mumbai',
          area_hint: 'Near Andheri Station',
          operating_hours: JSON.stringify({
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '16:00' },
            sunday: { closed: true }
          }),
          phone: '+919876543212',
          rating: 4.5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          partner_id: 1,
          name: 'City Medical Bandra',
          address: '456 Health Avenue, Bandra West, Mumbai',
          city: 'Mumbai',
          area_hint: 'Near Bandra Station',
          operating_hours: JSON.stringify({
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '08:00', close: '20:00' },
            saturday: { open: '08:00', close: '18:00' },
            sunday: { open: '09:00', close: '17:00' }
          }),
          phone: '+919876543213',
          rating: 4.8,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (centersError) throw centersError
    console.log('✅ Centers created')

    // Create services
    console.log('Creating services...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .upsert([
        {
          id: 1,
          partner_id: 1,
          name: 'MRI Brain Scan',
          description: 'Detailed brain imaging using Magnetic Resonance Imaging',
          modality: 'MRI',
          price: 3500,
          duration_minutes: 30,
          preparation_notes: 'Remove all metal objects. Inform about any implants.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          partner_id: 1,
          name: 'CT Scan Chest',
          description: 'Computed tomography scan of chest area',
          modality: 'CT',
          price: 2500,
          duration_minutes: 15,
          preparation_notes: 'No eating 4 hours before scan.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          partner_id: 1,
          name: 'X-Ray Chest',
          description: 'Standard chest X-ray examination',
          modality: 'XRAY',
          price: 500,
          duration_minutes: 5,
          preparation_notes: 'Remove jewelry and clothing from chest area.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (servicesError) throw servicesError
    console.log('✅ Services created')

    // Create slots
    console.log('Creating slots...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .upsert([
        {
          id: 1,
          center_id: 1,
          service_id: 1,
          start_time: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
          end_time: new Date(tomorrow.setHours(10, 30, 0, 0)).toISOString(),
          status: 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          center_id: 1,
          service_id: 1,
          start_time: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
          end_time: new Date(tomorrow.setHours(14, 30, 0, 0)).toISOString(),
          status: 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          center_id: 2,
          service_id: 2,
          start_time: new Date(dayAfterTomorrow.setHours(11, 0, 0, 0)).toISOString(),
          end_time: new Date(dayAfterTomorrow.setHours(11, 15, 0, 0)).toISOString(),
          status: 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (slotsError) throw slotsError
    console.log('✅ Slots created')

    // Create sample booking
    console.log('Creating sample booking...')
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .upsert([
        {
          id: 1,
          user_id: 3,
          service_id: 1,
          center_id: 1,
          slot_id: 1,
          patient_name: 'John Doe',
          patient_email: 'john.doe@example.com',
          patient_phone: '+919876543210',
          appointment_date: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
          status: 'confirmed',
          payment_status: 'paid',
          total_amount: 3500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' })
      .select()

    if (bookingsError) throw bookingsError
    console.log('✅ Sample booking created')

    console.log('🎉 Database seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()

import { NextResponse } from "next/server"
import supabase from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    console.log('🔍 Received booking data:', JSON.stringify(bookingData, null, 2))
    
    // Handle both new slot-based API and legacy booking page data
    if (bookingData.slot_id) {
      console.log('📍 Processing slot-based booking')
      // New slot-based booking (from BookingFlow component)
      const { data: slot, error: slotError } = await supabase
        .from('slots')
        .select('*, services(*), centers(*)')
        .eq('id', bookingData.slot_id)
        .eq('status', 'available')
        .single()

      if (slotError || !slot) {
        return NextResponse.json({ error: 'Slot not available' }, { status: 400 })
      }

      // Create booking
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: bookingData.user_id,
          service_id: slot.service_id,
          center_id: slot.center_id,
          slot_id: slot.id,
          patient_name: bookingData.patient_name,
          patient_email: bookingData.patient_email || '',
          patient_phone: bookingData.patient_phone,
          patient_age: bookingData.patient_age,
          patient_gender: bookingData.patient_gender,
          appointment_date: slot.start_time,
          total_amount: slot.price,
          status: 'pending'
        }
      ]).select('*, services(*), centers(*), slots(*)')

      if (error) {
        console.error('Supabase booking insert error:', error)
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
      }

      // Update slot status to booked
      await supabase
        .from('slots')
        .update({ status: 'booked' })
        .eq('id', slot.id)

      // Map booking object to camelCase keys
      const booking = data?.[0]
      const camelBooking = booking ? {
        ...booking,
        totalAmount: booking.total_amount,
        patientName: booking.patient_name,
        patientEmail: booking.patient_email,
        patientPhone: booking.patient_phone,
        patientAge: booking.patient_age,
        patientGender: booking.patient_gender,
        appointmentDate: booking.appointment_date,
        serviceId: booking.service_id,
        centerId: booking.center_id,
        slotId: booking.slot_id,
        notes: booking.notes,
        status: booking.status,
      } : undefined
      return NextResponse.json({ 
        booking: camelBooking, 
        id: camelBooking?.id,
        message: 'Booking created successfully',
        holdExpiresAt: Date.now() + (7 * 60 * 1000)
      })
    } else {
      console.log('📍 Processing legacy booking page format')
      // Legacy booking page format
      // Expected: { serviceId, centerId, date, time, patientName, patientPhone, patientEmail, etc. }
      
      // Validate required fields
      if (!bookingData.serviceId || !bookingData.centerId || !bookingData.date || !bookingData.time || !bookingData.patientName || !bookingData.patientPhone) {
        return NextResponse.json({ error: 'Missing required booking information' }, { status: 400 })
      }

      // Handle string serviceId - could be slug or numeric ID
      let serviceQuery = supabase.from('services').select('*')
      if (isNaN(Number(bookingData.serviceId))) {
        // It's a slug like "mri-brain", convert to searchable name
        const searchName = bookingData.serviceId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        console.log(`🔍 Looking for service with name like: "${searchName}"`)
        serviceQuery = serviceQuery.ilike('name', `%${searchName}%`)
      } else {
        // It's a numeric ID
        serviceQuery = serviceQuery.eq('id', parseInt(bookingData.serviceId))
      }

      const { data: service, error: serviceError } = await serviceQuery.single()

      if (serviceError || !service) {
        console.log('❌ Service not found for:', bookingData.serviceId, 'Error:', serviceError)
        return NextResponse.json({ error: 'Service not found' }, { status: 400 })
      }
      console.log('✅ Found service:', service.name)

      // Handle string centerId - could be slug or numeric ID  
      let centerQuery = supabase.from('centers').select('*')
      if (isNaN(Number(bookingData.centerId))) {
        // It's a slug like "medanta-diagnostics", convert to searchable name
        const searchName = bookingData.centerId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        console.log(`🔍 Looking for center with name like: "${searchName}"`)
        centerQuery = centerQuery.ilike('name', `%${searchName}%`)
      } else {
        // It's a numeric ID
        centerQuery = centerQuery.eq('id', parseInt(bookingData.centerId))
      }

      const { data: center, error: centerError } = await centerQuery.single()

      if (centerError || !center) {
        console.log('❌ Center not found for:', bookingData.centerId, 'Error:', centerError)
        return NextResponse.json({ error: 'Center not found' }, { status: 400 })
      }
      console.log('✅ Found center:', center.name)

      // Create appointment datetime
      const appointmentDate = new Date(`${bookingData.date}T${bookingData.time}:00`)
      
      // Create booking without user_id (for guest bookings)
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: null, // Guest booking
          service_id: service.id, // Use the found service ID
          center_id: center.id,   // Use the found center ID
          slot_id: null, // No specific slot for legacy bookings
          patient_name: bookingData.patientName,
          patient_email: bookingData.patientEmail || '',
          patient_phone: bookingData.patientPhone,
          patient_age: bookingData.patientAge,
          patient_gender: bookingData.patientGender,
          appointment_date: appointmentDate.toISOString(),
          total_amount: bookingData.totalAmount || service.price,
          notes: bookingData.notes,
          status: 'pending'
        }
      ]).select('*')

      if (error) {
        console.error('Supabase booking insert error:', error)
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
      }

      // Map booking object to camelCase keys
      const booking = data?.[0]
      const camelBooking = booking ? {
        ...booking,
        totalAmount: booking.total_amount,
        patientName: booking.patient_name,
        patientEmail: booking.patient_email,
        patientPhone: booking.patient_phone,
        patientAge: booking.patient_age,
        patientGender: booking.patient_gender,
        appointmentDate: booking.appointment_date,
        serviceId: booking.service_id,
        centerId: booking.center_id,
        slotId: booking.slot_id,
        notes: booking.notes,
        status: booking.status,
      } : undefined
      return NextResponse.json({ 
        booking: camelBooking,
        id: camelBooking?.id,
        message: 'Booking created successfully'
      })
    }
  } catch (err) {
    console.error('Booking creation error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const user_id = url.searchParams.get('user_id')
    const status = url.searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select('*, services(*), centers(*), slots(*), users(*)')

    if (id) {
      query = query.eq('id', id)
      const { data, error } = await query.single()
      if (error) {
        console.error('Supabase booking fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
      }
      
      // Map booking object to camelCase keys for consistency with frontend
      const booking = data
      const camelBooking = booking ? {
        ...booking,
        totalAmount: booking.total_amount,
        patientName: booking.patient_name,
        patientEmail: booking.patient_email,
        patientPhone: booking.patient_phone,
        patientAge: booking.patient_age,
        patientGender: booking.patient_gender,
        appointmentDate: booking.appointment_date,
        serviceId: booking.service_id,
        centerId: booking.center_id,
        slotId: booking.slot_id,
        notes: booking.notes,
        status: booking.status,
      } : undefined
      
      return NextResponse.json(camelBooking)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Supabase bookings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Bookings fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, payment_status, notes } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const updates: any = {}
    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status
    if (notes !== undefined) updates.notes = notes
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, services(*), centers(*)')
      .single()

    if (error) {
      console.error('Supabase booking update error:', error)
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Booking update error:', err)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

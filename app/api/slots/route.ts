import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabaseClient'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const service = url.searchParams.get('service')
    const center_id = url.searchParams.get('center_id')
    const date = url.searchParams.get('date')
    const status = url.searchParams.get('status') || 'available'

    let query = supabase
      .from('slots')
      .select('*, services(*), centers(*)')
      .eq('status', status)
      .gte('start_time', new Date().toISOString()) // Only future slots

    if (city) {
      query = query.eq('centers.city', city)
    }

    if (service) {
      // Assuming service is either ID or slug
      if (isNaN(Number(service))) {
        query = query.eq('services.name', service)
      } else {
        query = query.eq('service_id', service)
      }
    }

    if (center_id) {
      query = query.eq('center_id', center_id)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
    }

    const { data, error } = await query.order('start_time')

    if (error) {
      console.error('Supabase slots fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
    }

    return NextResponse.json({ 
      slots: data || [],
      centers: [...new Set(data?.map(slot => slot.centers) || [])]
    })
  } catch (err) {
    console.error('Slots fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const slotData = await request.json()
    
    // Validate that the slot doesn't conflict with existing ones
    const { data: conflictingSlots, error: conflictError } = await supabase
      .from('slots')
      .select('id')
      .eq('center_id', slotData.center_id)
      .eq('service_id', slotData.service_id)
      .gte('end_time', slotData.start_time)
      .lte('start_time', slotData.end_time)

    if (conflictError) {
      console.error('Conflict check error:', conflictError)
      return NextResponse.json({ error: 'Failed to check slot conflicts' }, { status: 500 })
    }

    if (conflictingSlots && conflictingSlots.length > 0) {
      return NextResponse.json({ error: 'Slot conflicts with existing booking' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('slots')
      .insert([{
        center_id: slotData.center_id,
        service_id: slotData.service_id,
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        price: slotData.price,
        status: slotData.status || 'available',
        tat_hours: slotData.tat_hours || 24
      }])
      .select('*, services(*), centers(*)')
      .single()

    if (error) {
      console.error('Supabase slot insert error:', error)
      return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Slot creation error:', err)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Slot ID required' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('slots')
      .update(updates)
      .eq('id', id)
      .select('*, services(*), centers(*)')
      .single()

    if (error) {
      console.error('Supabase slot update error:', error)
      return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Slot update error:', err)
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Slot ID required' }, { status: 400 })
    }

    // Check if slot is booked
    const { data: slot, error: fetchError } = await supabase
      .from('slots')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.status === 'booked') {
      return NextResponse.json({ error: 'Cannot delete booked slot' }, { status: 400 })
    }

    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase slot delete error:', error)
      return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Slot deleted successfully' })
  } catch (err) {
    console.error('Slot deletion error:', err)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}

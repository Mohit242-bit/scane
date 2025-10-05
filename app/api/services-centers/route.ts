import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabaseClient'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all services and centers, then create relationships based on available slots
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)

    if (servicesError) {
      console.error('Supabase services fetch error:', servicesError)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    const { data: centers, error: centersError } = await supabase
      .from('centers')
      .select('*')
      .eq('is_active', true)

    if (centersError) {
      console.error('Supabase centers fetch error:', centersError)
      return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 })
    }

    // Get slot data to determine which services are available at which centers
    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('service_id, center_id')
      .eq('status', 'available')

    if (slotsError) {
      console.error('Supabase slots fetch error:', slotsError)
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
    }

    // Create a mapping of service ID to array of center IDs
    const servicesCentersMap: Record<string, string[]> = {}
    
    // Group slots by service_id to get centers for each service
    const slotsByService = slots.reduce((acc: any, slot: any) => {
      if (!acc[slot.service_id]) {
        acc[slot.service_id] = new Set()
      }
      acc[slot.service_id].add(slot.center_id.toString())
      return acc
    }, {})

    // Convert to the format expected by frontend
    for (const service of services) {
      const centerIds = slotsByService[service.id] || new Set()
      servicesCentersMap[service.id.toString()] = Array.from(centerIds)
    }

    return NextResponse.json({
      services: services || [],
      servicesCentersMap: servicesCentersMap || {}
    })
  } catch (err) {
    console.error('Services-centers fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch services and centers' }, { status: 500 })
  }
}

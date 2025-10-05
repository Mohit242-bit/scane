import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabaseClient'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const partner_id = url.searchParams.get('partner_id')
    const is_active = url.searchParams.get('is_active')

    let query = supabase
      .from('services')
      .select('*, partners!inner(*), centers!services_partner_id_fkey(*)')

    if (city) {
      query = query.eq('centers.city', city)
    }

    if (partner_id) {
      query = query.eq('partner_id', partner_id)
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    } else {
      // Default to active services only
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('name')

    if (error) {
      console.error('Supabase services fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Services fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const serviceData = await request.json()
    
    const { data, error } = await supabase
      .from('services')
      .insert([{
        partner_id: serviceData.partner_id,
        name: serviceData.name,
        description: serviceData.description,
        modality: serviceData.modality,
        price: serviceData.price,
        duration_minutes: serviceData.duration_minutes || 30,
        preparation_instructions: serviceData.preparation_instructions,
        is_active: serviceData.is_active !== false
      }])
      .select('*, partners(*)')
      .single()

    if (error) {
      console.error('Supabase service insert error:', error)
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Service creation error:', err)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select('*, partners(*)')
      .single()

    if (error) {
      console.error('Supabase service update error:', error)
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Service update error:', err)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

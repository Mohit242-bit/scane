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
      .from('centers')
      .select('*, partners(*)')

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (partner_id) {
      query = query.eq('partner_id', partner_id)
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    } else {
      // Default to active centers only
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('name')

    if (error) {
      console.error('Supabase centers fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Centers fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const centerData = await request.json()
    
    const { data, error } = await supabase
      .from('centers')
      .insert([{
        partner_id: centerData.partner_id,
        name: centerData.name,
        address: centerData.address,
        city: centerData.city,
        area_hint: centerData.area_hint,
        phone: centerData.phone,
        email: centerData.email,
        operating_hours: centerData.operating_hours,
        amenities: centerData.amenities,
        latitude: centerData.latitude,
        longitude: centerData.longitude,
        is_active: centerData.is_active !== false
      }])
      .select('*, partners(*)')
      .single()

    if (error) {
      console.error('Supabase center insert error:', error)
      return NextResponse.json({ error: 'Failed to create center' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Center creation error:', err)
    return NextResponse.json({ error: 'Failed to create center' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Center ID required' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('centers')
      .update(updates)
      .eq('id', id)
      .select('*, partners(*)')
      .single()

    if (error) {
      console.error('Supabase center update error:', error)
      return NextResponse.json({ error: 'Failed to update center' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Center update error:', err)
    return NextResponse.json({ error: 'Failed to update center' }, { status: 500 })
  }
}

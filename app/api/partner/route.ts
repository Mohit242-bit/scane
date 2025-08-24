import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabaseClient'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const user_id = url.searchParams.get('user_id')
    const status = url.searchParams.get('status')
    const city = url.searchParams.get('city')

    let query = supabase
      .from('partners')
      .select('*, users(*)')

    if (id) {
      query = query.eq('id', id)
      const { data, error } = await query.single()
      if (error) {
        console.error('Supabase partner fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 })
      }
      return NextResponse.json(data)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase partners fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Partners fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const partnerData = await request.json()
    
    const { data, error } = await supabase
      .from('partners')
      .insert([{
        user_id: partnerData.user_id,
        business_name: partnerData.business_name,
        business_email: partnerData.business_email,
        business_phone: partnerData.business_phone,
        address: partnerData.address,
        city: partnerData.city,
        status: partnerData.status || 'pending'
      }])
      .select('*, users(*)')
      .single()

    if (error) {
      console.error('Supabase partner insert error:', error)
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Partner creation error:', err)
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select('*, users(*)')
      .single()

    if (error) {
      console.error('Supabase partner update error:', error)
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Partner update error:', err)
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
  }
}

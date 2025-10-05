import { NextResponse } from "next/server"
import supabase from '../../../../lib/supabaseClient'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(*), centers(*), slots(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase booking fetch error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Booking fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

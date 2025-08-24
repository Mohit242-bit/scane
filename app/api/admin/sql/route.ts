import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import supabase from '@/lib/supabaseClient'

const bannedKeywords = [
  'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE', 'INSERT', 'UPDATE', 'DELETE', 'COPY', ';'
]

export async function POST(request: NextRequest) {
  try {
    // Check MVP admin authentication
    const token = request.cookies.get("mvp_admin")?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.ADMIN_MVP_SECRET!) as any
      if (decoded.role !== "admin") {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const sql: string = (body?.sql || '').trim()

    if (!sql) {
      return NextResponse.json({ error: 'SQL is required' }, { status: 400 })
    }

    // Basic safety: only allow SELECT queries and disallow dangerous keywords
    const upper = sql.toUpperCase()
    if (!upper.startsWith('SELECT')) {
      return NextResponse.json({ error: 'Only SELECT queries are allowed' }, { status: 400 })
    }

    for (const kw of bannedKeywords) {
      if (upper.includes(kw)) {
        return NextResponse.json({ error: 'Query contains disallowed keywords' }, { status: 400 })
      }
    }

    // Execute query using Supabase client
    // For security, we'll use rpc or a more limited approach
    // Since we can't execute arbitrary SQL directly, let's return an error for now
    // and implement specific query endpoints instead
    
    // For MVP, let's just handle some basic queries manually
    try {
      if (upper.includes('SELECT * FROM PUBLIC.USERS')) {
        const { data, error } = await supabase.from('users').select('*')
        if (error) throw error
        return NextResponse.json({ data: data || [] })
      }
      
      if (upper.includes('SELECT * FROM PUBLIC.BOOKINGS')) {
        const { data, error } = await supabase.from('bookings').select('*')
        if (error) throw error
        return NextResponse.json({ data: data || [] })
      }
      
      if (upper.includes('SELECT * FROM PUBLIC.SERVICES')) {
        const { data, error } = await supabase.from('services').select('*')
        if (error) throw error
        return NextResponse.json({ data: data || [] })
      }
      
      if (upper.includes('SELECT * FROM PUBLIC.CENTERS')) {
        const { data, error } = await supabase.from('centers').select('*')
        if (error) throw error
        return NextResponse.json({ data: data || [] })
      }
      
      if (upper.includes('SELECT * FROM PUBLIC.PARTNERS')) {
        const { data, error } = await supabase.from('partners').select('*')
        if (error) throw error
        return NextResponse.json({ data: data || [] })
      }
      
      // For other queries, return a message about limited support
      return NextResponse.json({ 
        error: 'Custom SQL queries are limited. Use the table tabs for data access.' 
      }, { status: 400 })
      
    } catch (queryError: any) {
      console.error('Query execution error:', queryError)
      return NextResponse.json({ 
        error: queryError.message || 'Query execution failed' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Admin SQL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

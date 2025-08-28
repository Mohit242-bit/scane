import { createClient } from '@supabase/supabase-js'

// Prefer NEXT_PUBLIC_* vars for browser; server can use SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // warn at runtime if not configured
  // eslint-disable-next-line no-console
  console.warn('Supabase keys are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

// On the server, prefer the service role key if available
const clientKey = typeof window === 'undefined' ? SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY : SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, clientKey)

export default supabase

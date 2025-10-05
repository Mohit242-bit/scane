/**
 * Supabase Client Configuration
 * Provides singleton Supabase client instance with proper configuration
 */

import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import { logger } from './logger'

// Validate that required Supabase environment variables are present
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const error = new Error(
    'Missing required Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file'
  )
  logger.error('Supabase configuration error', error)
  throw error
}

/**
 * Singleton Supabase client
 * Uses service role key on server-side when available for elevated permissions
 * Uses anon key on client-side for row-level security
 */
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  // Prefer service role key on server, fallback to anon key
  typeof window === 'undefined' && env.SUPABASE_SERVICE_ROLE_KEY
    ? env.SUPABASE_SERVICE_ROLE_KEY
    : env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: typeof window !== 'undefined', // Only persist in browser
      detectSessionInUrl: typeof window !== 'undefined',
    },
  }
)

logger.info('Supabase client initialized', {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceRole: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  isServer: typeof window === 'undefined',
})

export default supabase


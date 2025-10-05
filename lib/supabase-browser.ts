/**
 * Browser-side Supabase Client with SSR support
 * Uses @supabase/ssr for proper cookie handling in Next.js
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

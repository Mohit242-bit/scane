"use client"

import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

// This component is no longer needed since we're using Supabase auth
// Keeping it for backward compatibility, but it just passes through children
export default function AuthSessionProvider({ children }: Props) {
  return <>{children}</>
}

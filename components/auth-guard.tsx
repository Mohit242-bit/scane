"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoadingSpinner from "./loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ children, requireAuth = true, redirectTo = "/auth/signin" }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (requireAuth && !session) {
      router.push(redirectTo)
      return
    }

    if (!requireAuth && session) {
      router.push("/") // Redirect authenticated users away from auth pages
      return
    }
  }, [session, status, requireAuth, redirectTo, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !session) {
    return null // Will redirect
  }

  if (!requireAuth && session) {
    return null // Will redirect
  }

  return <>{children}</>
}

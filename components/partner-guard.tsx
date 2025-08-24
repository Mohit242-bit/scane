"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"

interface PartnerGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PartnerGuard({ children, fallback }: PartnerGuardProps) {
  const router = useRouter()
  const [isPartner, setIsPartner] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        // Check for development mode partner session first
        const devUser = localStorage.getItem('dev-partner-user')
        if (devUser) {
          console.log("Development mode partner detected")
          setIsPartner(true)
          setIsLoading(false)
          return
        }

        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          console.log("No authenticated user, redirecting to login")
          router.push("/partner/login")
          return
        }

        console.log("Authenticated user:", user.id, user.email)

        // Check if user is a partner
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        console.log("User role check:", { userData, error })

        if (error) {
          console.error("Error checking user role:", error)
          // If user doesn't exist in users table, they need to login again
          if (error.code === "PGRST116") {
            console.log("User not found in users table, redirecting to login")
            router.push("/partner/login")
            return
          }
        }

        if (!userData || userData.role !== "partner") {
          console.log("User is not a partner, role:", userData?.role)
          setIsPartner(false)
          router.push("/partner/login")
          return
        }

        console.log("User is a valid partner")
        setIsPartner(true)
      } catch (error) {
        console.error("Partner check error:", error)
        setIsPartner(false)
        router.push("/partner/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkPartnerStatus()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA1A7] mx-auto mb-4"></div>
          <p className="text-[#5B6B7A]">Checking access...</p>
        </div>
      </div>
    )
  }

  if (isPartner === false) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0B1B2B] mb-2">Access Denied</h1>
          <p className="text-[#5B6B7A]">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default function PartnerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      
      if (!user) {
        router.push("/partner/login")
        return
      }

      // Redirect authenticated partners to dashboard
      router.push("/partner/dashboard")
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA1A7] mx-auto mb-4"></div>
        <p className="text-[#5B6B7A]">Loading...</p>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function PartnerPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/partner/login")
      return
    }

    // Redirect authenticated partners to dashboard
    router.push("/partner/dashboard")
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA1A7] mx-auto mb-4"></div>
          <p className="text-[#5B6B7A]">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}

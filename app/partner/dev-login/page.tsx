"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Building2, AlertCircle, Mail } from "lucide-react"
import supabase from "@/lib/supabaseClient"

export default function PartnerDevLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter an email")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Create a mock partner session for development
      const mockUserData = {
        id: `dev-partner-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: email.split('@')[0],
          role: 'partner',
          provider: 'development'
        }
      }

      // Set user data in localStorage for development
      localStorage.setItem('dev-partner-user', JSON.stringify(mockUserData))
      
      toast({
        title: "Development login successful",
        description: "You're now logged in as a partner (development mode)"
      })

      // Redirect to partner onboarding
      router.push("/partner/onboarding")
      
    } catch (error) {
      console.error("Dev login error:", error)
      setError("Development login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-[#0B1B2B]">Partner Dev Login</CardTitle>
          <CardDescription className="text-lg">
            Development mode - bypass OAuth for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a development bypass. In production, you would use Google OAuth.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (for testing)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#0AA1A7] hover:bg-[#089098] text-base"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Dev Login as Partner"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/partner/login")}
              className="w-full"
              disabled={isLoading}
            >
              Back to OAuth Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Chrome, Mail, Building2, AlertCircle } from "lucide-react"

export default function PartnerLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    city: "",
    password: ""
  })
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      console.log("Initiating Google OAuth with redirect:", `${window.location.origin}/api/auth/callback?redirectTo=/partner/dashboard`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=/partner/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      console.log("OAuth response:", { data, error })
      
      if (error) {
        console.error("OAuth error:", error)
        setError("Failed to login with Google: " + error.message)
        return
      }
      
      // Redirect handled by OAuth flow
    } catch (error) {
      console.error("Google login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (authError) {
        setError("Invalid email or password")
        return
      }

      // Check if user has partner role in their metadata or profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Authentication failed")
        return
      }

      // Check if partner profile exists
      const profileResponse = await fetch('/api/partner/profile', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (profileResponse.status === 404) {
        // No partner profile, redirect to onboarding
        router.push("/partner/onboarding")
        return
      }

      if (!profileResponse.ok) {
        setError("Unable to verify partner status")
        return
      }

      router.push("/partner/dashboard")
      toast({
        title: "Login successful",
        description: "Welcome to your partner dashboard!"
      })
    } catch (error) {
      console.error("Email login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { name, email, phone, businessName, businessEmail, businessPhone, address, city, password } = signUpData
    
    if (!name || !email || !phone || !businessName || !businessEmail || !address || !city || !password) {
      setError("Please fill in all required fields")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Create auth user with real password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            role: 'partner'
          }
        }
      })

      if (authError) {
        setError("Failed to create account: " + authError.message)
        return
      }

      if (!authData.user) {
        setError("Failed to create user account")
        return
      }

      // Insert partner profile in Supabase
      const { error: profileError } = await supabase
        .from("partner_profiles")
        .insert({
          user_id: authData.user.id,
          google_email: email,
          full_name: name,
          phone: phone,
          business_name: businessName,
          business_registration_number: "",
          gst_number: "",
          pan_number: "",
          bank_account_details: {},
          onboarding_completed: false,
          verification_status: "pending"
        });

      if (profileError) {
        setError("Failed to create partner profile: " + profileError.message);
        return;
      }

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account, then complete your partner onboarding."
      })
      
      setShowSignUp(false)
      setSignUpData({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        businessEmail: "",
        businessPhone: "",
        address: "",
        city: "",
        password: ""
      })
    } catch (error) {
      console.error("Sign up error:", error)
      setError("An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#0B1B2B]">Partner Sign Up</CardTitle>
            <CardDescription className="text-lg">
              Join Scanezy as a healthcare partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={signUpData.businessName}
                    onChange={(e) => setSignUpData({ ...signUpData, businessName: e.target.value })}
                    placeholder="Your medical center name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={signUpData.businessEmail}
                    onChange={(e) => setSignUpData({ ...signUpData, businessEmail: e.target.value })}
                    placeholder="contact@yourmedical.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  value={signUpData.businessPhone}
                  onChange={(e) => setSignUpData({ ...signUpData, businessPhone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={signUpData.address}
                    onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                    placeholder="Full business address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={signUpData.city}
                    onChange={(e) => setSignUpData({ ...signUpData, city: e.target.value })}
                    placeholder="City name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  placeholder="Enter a password"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-[#0AA1A7] hover:bg-[#089098]"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Partner Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSignUp(false)
                    setError("")
                  }}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-[#0B1B2B]">Partner Login</CardTitle>
          <CardDescription className="text-lg">
            Access your healthcare partner dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            <Chrome className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#5B6B7A]">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#0AA1A7] hover:bg-[#089098] text-base"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign in with Email"}
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-[#5B6B7A] mb-3">
              Don't have a partner account?
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setShowSignUp(true)
                setError("")
              }}
              className="w-full"
              disabled={isLoading}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Sign up as Partner
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-[#5B6B7A] mb-2">Development Mode</p>
              <Button
                variant="outline"
                onClick={() => router.push("/partner/dev-login")}
                className="w-full"
                disabled={isLoading}
              >
                Dev Login (Bypass OAuth)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

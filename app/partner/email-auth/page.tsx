"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Building2, AlertCircle, Eye, EyeOff } from "lucide-react"
import supabase from "@/lib/supabaseClient"

export default function PartnerAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    address: "",
    city: ""
  })

  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      console.log("Attempting login with:", loginData.email)

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (authError) {
        console.error("Auth error:", authError)
        setError("Invalid email or password")
        return
      }

      if (!authData.user) {
        setError("Login failed - no user data")
        return
      }

      console.log("Login successful, user:", authData.user.id)

      // Check if user exists in public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", authData.user.id)
        .single()

      if (userError && userError.code === "PGRST116") {
        // User doesn't exist in public.users, create them
        console.log("Creating user in public.users table")
        const { error: createUserError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: authData.user.user_metadata?.full_name || loginData.email.split('@')[0],
            role: "partner",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createUserError) {
          console.error("Error creating user:", createUserError)
          setError("Failed to create user profile")
          return
        }
      } else if (!userError) {
        // Update role to partner if needed
        if (userData.role !== "partner") {
          await supabase
            .from("users")
            .update({ role: "partner", updated_at: new Date().toISOString() })
            .eq("id", authData.user.id)
        }
      }

      // Check if partner profile exists
      const { data: partnerProfile, error: profileError } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("user_id", authData.user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // No partner profile, redirect to onboarding
        console.log("No partner profile found, redirecting to onboarding")
        router.push("/partner/onboarding")
        return
      }

      if (partnerProfile && !partnerProfile.onboarding_completed) {
        // Profile exists but onboarding not completed
        console.log("Partner profile exists but onboarding not completed")
        router.push("/partner/onboarding")
        return
      }

      // Partner profile exists and onboarding completed
      console.log("Partner profile complete, redirecting to dashboard")
      router.push("/partner/dashboard")
      
      toast({
        title: "Login successful",
        description: "Welcome to your partner dashboard!"
      })

    } catch (error: any) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { email, password, confirmPassword, fullName, phone, businessName } = signUpData
    
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      console.log("Creating new partner account:", email)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'partner'
          }
        }
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        setError("Failed to create account: " + authError.message)
        return
      }

      if (!authData.user) {
        setError("Failed to create user account")
        return
      }

      console.log("Auth user created:", authData.user.id)

      // Create user in public.users table
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          phone: phone,
          role: "partner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userError) {
        console.error("Error creating user profile:", userError)
        // Continue anyway, user can complete profile later
      }

      // Create initial partner profile
      const { error: profileError } = await supabase
        .from("partner_profiles")
        .insert({
          user_id: authData.user.id,
          google_email: email,
          full_name: fullName,
          phone: phone,
          business_name: businessName || null,
          onboarding_completed: false,
          verification_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error("Error creating partner profile:", profileError)
        // Continue anyway, profile can be created later
      }

      toast({
        title: "Account created successfully",
        description: authData.user.email_confirmed_at ? 
          "Your account is ready! Redirecting to onboarding..." :
          "Please check your email to verify your account, then complete your partner onboarding."
      })

      // If email is confirmed (usually in development), redirect to onboarding
      if (authData.user.email_confirmed_at || process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          router.push("/partner/onboarding")
        }, 1500)
      } else {
        // Reset form for email verification flow
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          phone: "",
          businessName: "",
          businessEmail: "",
          businessPhone: "",
          address: "",
          city: ""
        })
        setShowSignUp(false)
      }

    } catch (error: any) {
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
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={signUpData.businessName}
                  onChange={(e) => setSignUpData({ ...signUpData, businessName: e.target.value })}
                  placeholder="Your medical center name"
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="partner@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
                Dev Login (Skip Auth)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

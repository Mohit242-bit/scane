"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Chrome, 
  Building2, 
  AlertCircle, 
  MapPin,
  Users,
  Calendar,
  Shield,
  TrendingUp,
  CheckCircle
} from "lucide-react"

export default function PartnerUSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEmailSignup, setShowEmailSignup] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      // Generate a temporary password for the user
      const tempPassword = Math.random().toString(36).slice(-12) + "Temp123!"
      
      console.log("Creating account with email:", email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            role: 'partner',
            signup_method: 'partner_us_email',
            full_name: email.split('@')[0] // Use email prefix as temporary name
          },
          emailRedirectTo: `${window.location.origin}/partner/onboarding`
        }
      })
      
      if (error) {
        console.error("Email signup error:", error)
        setError(error.message)
        return
      }
      
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to continue."
        })
      } else if (data?.user) {
        // User is already confirmed, redirect to onboarding
        router.push("/partner/onboarding")
      }
      
    } catch (error) {
      console.error("Email signup error:", error)
      setError("An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      console.log("Environment check:")
      console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("SUPABASE_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING")
      
      const redirectTo = `${window.location.origin}/api/auth/callback?redirectTo=/partner/onboarding`
      console.log("OAuth redirect URL:", redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      console.log("OAuth response:", { data, error })
      
      if (error) {
        console.error("OAuth error details:", error)
        setError(`Google signup is currently unavailable. Please use email signup instead.`)
        setShowEmailSignup(true)
        return
      }
      
      if (data?.url) {
        console.log("Redirecting to Google OAuth URL:", data.url)
        // The redirect should happen automatically
      } else {
        console.error("No OAuth URL returned")
        setError("Google signup is currently unavailable. Please use email signup instead.")
        setShowEmailSignup(true)
      }
      
    } catch (error) {
      console.error("Google signup error:", error)
      setError("Google signup is currently unavailable. Please use email signup instead.")
      setShowEmailSignup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Reach more patients and grow your practice with our platform"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Automated booking system that manages your appointments"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive tools to manage patient information and history"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA-compliant platform ensuring patient data security"
    }
  ]

  const features = [
    "Real-time appointment booking",
    "Automated SMS & email notifications",
    "Digital payment integration", 
    "Patient record management",
    "Analytics and reporting dashboard",
    "24/7 customer support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-[#0AA1A7]" />
            <span className="text-2xl font-bold text-[#0B1B2B]">Scanezy</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/partner/login")}
          >
            Already a Partner?
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits & Features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#0B1B2B] mb-4">
                Partner with
                <span className="text-[#0AA1A7]"> Scanezy</span>
              </h1>
              <p className="text-xl text-[#5B6B7A] mb-6">
                Join India's leading healthcare booking platform and grow your medical practice
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-[#0AA1A7]/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#0AA1A7]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0B1B2B] mb-1">{benefit.title}</h3>
                      <p className="text-sm text-[#5B6B7A]">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0B1B2B]">Platform Features</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#0AA1A7] flex-shrink-0" />
                    <span className="text-sm text-[#5B6B7A]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Building2 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-[#0B1B2B]">
                  Join as Partner
                </CardTitle>
                <CardDescription className="text-base">
                  Start your journey with Scanezy in just 2 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={handleGoogleSignup}
                    className="w-full h-12 text-base bg-[#0AA1A7] hover:bg-[#089098]"
                    disabled={isLoading}
                  >
                    <Chrome className="mr-3 h-5 w-5" />
                    {isLoading ? "Starting..." : "Sign up with Google"}
                  </Button>

                  {!showEmailSignup && (
                    <div className="text-center">
                      <p className="text-sm text-[#5B6B7A] mb-2">
                        Or if Google signup isn't working:
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowEmailSignup(true)}
                        className="w-full"
                        disabled={isLoading}
                      >
                        Sign up with Email Instead
                      </Button>
                    </div>
                  )}

                  {showEmailSignup && (
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base bg-[#0AA1A7] hover:bg-[#089098]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Partner Account"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailSignup(false)}
                        className="w-full"
                        disabled={isLoading}
                      >
                        Back to Google Signup
                      </Button>
                    </form>
                  )}

                  {!showEmailSignup && (
                    <div className="text-center">
                      <p className="text-sm text-[#5B6B7A]">
                        Sign up with your Google account and we'll guide you through
                        setting up your medical center profile.
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Process Steps */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#0B1B2B] text-center">Quick Setup Process</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
                      <div className="w-6 h-6 rounded-full bg-[#0AA1A7] text-white flex items-center justify-center text-xs font-semibold">1</div>
                      <span>Sign up with Google</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
                      <div className="w-6 h-6 rounded-full bg-[#0AA1A7] text-white flex items-center justify-center text-xs font-semibold">2</div>
                      <span>Add your center location & services</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
                      <div className="w-6 h-6 rounded-full bg-[#0AA1A7] text-white flex items-center justify-center text-xs font-semibold">3</div>
                      <span>Start receiving bookings!</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-[#5B6B7A]">
                    By signing up, you agree to our{" "}
                    <a href="/terms" className="text-[#0AA1A7] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-[#0AA1A7] hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 pt-16 border-t">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0B1B2B] mb-2">
              Trusted by Medical Centers Across India
            </h2>
            <p className="text-[#5B6B7A]">
              Join thousands of healthcare providers already using Scanezy
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#0AA1A7] mb-1">500+</div>
              <div className="text-[#5B6B7A]">Medical Centers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0AA1A7] mb-1">50K+</div>
              <div className="text-[#5B6B7A]">Appointments Booked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0AA1A7] mb-1">25+</div>
              <div className="text-[#5B6B7A]">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

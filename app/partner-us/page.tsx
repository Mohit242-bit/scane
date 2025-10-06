"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase-browser";
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
} from "lucide-react";

export default function PartnerUSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    businessName: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsLoggedIn(true);
      setUserEmail(user.email || "");
    }
  };

  // Use shared Supabase client (same as working partner login)

  const handlePartnerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { email, password, confirmPassword, fullName, phone, businessName } = formData;
    
    // Validation
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      console.log("Creating partner account:", email);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: "partner"
          },
          emailRedirectTo: `${window.location.origin}/partner-us`
        }
      });
      
      if (authError) {
        console.error("Auth signup error:", authError);
        setError(authError.message);
        return;
      }
      
      if (!authData.user) {
        setError("Failed to create user account");
        return;
      }
      
      console.log("User created:", authData.user.id);
      
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
        });
      
      if (userError) {
        console.error("Error creating user profile:", userError);
        // Continue anyway, user can complete profile later
      }
      
      // Create initial partner entry
      const { error: partnerError } = await supabase
        .from("partners")
        .insert({
          user_id: authData.user.id,
          business_name: businessName || `${fullName}'s Practice`,
          business_email: email,
          business_phone: phone,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (partnerError) {
        console.error("Error creating partner profile:", partnerError);
        // Continue anyway
      }
      
      if (authData.user.email_confirmed_at || process.env.NODE_ENV === "development") {
        // Email confirmed or dev mode, log them in
        setIsLoggedIn(true);
        setUserEmail(email);
        toast({
          title: "Account Created!",
          description: "Your partner account has been created successfully."
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to continue."
        });
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


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
  ];

  const features = [
    "Real-time appointment booking",
    "Automated SMS & email notifications",
    "Digital payment integration", 
    "Patient record management",
    "Analytics and reporting dashboard",
    "24/7 customer support"
  ];

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
                const Icon = benefit.icon;
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
                );
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
                
                {/* Show success state if logged in */}
                {isLoggedIn && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        You're logged in as: <strong>{userEmail}</strong>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/partner/details")}
                        className="w-full bg-[#0AA1A7] hover:bg-[#089098]"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Complete Partner Registration
                      </Button>
                      
                      <Button
                        onClick={() => router.push("/partner/dashboard")}
                        variant="outline"
                        className="w-full"
                      >
                        Go to Partner Dashboard
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setIsLoggedIn(false);
                          setUserEmail("");
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Show signup form if not logged in */}
                {!isLoggedIn && (
                  <form onSubmit={handlePartnerSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="At least 6 characters"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name (Optional)</Label>
                        <Input
                          id="businessName"
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                          placeholder="Medical Center Name"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-[#0AA1A7] hover:bg-[#089098]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Partner Account"}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-[#5B6B7A]">
                        Already have an account?{" "}
                        <Button
                          variant="link"
                          onClick={() => router.push("/partner/login")}
                          className="p-0 text-[#0AA1A7] hover:underline"
                        >
                          Sign in here
                        </Button>
                      </p>
                    </div>
                  </form>
                )}

                <Separator />

                {/* Process Steps */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#0B1B2B] text-center">Quick Setup Process</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#5B6B7A]">
                      <div className="w-6 h-6 rounded-full bg-[#0AA1A7] text-white flex items-center justify-center text-xs font-semibold">1</div>
                      <span>Sign up with email & details</span>
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
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, MessageSquare, Mail } from "lucide-react";
import { signInWithGoogle, signInWithEmail, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase-browser";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | "google">("phone");
  const [step, setStep] = useState<"phone" | "otp" | "email">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Check if user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push(callbackUrl);
      }
    };
    checkUser();
  }, [router, callbackUrl]);

  const sendOTP = async () => {
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setStep("otp");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // For demo purposes, accept "123456" as valid OTP
      if (otp === "123456") {
        // Create or sign in user with phone
        // For now, we'll create a dummy email for phone-based auth
        const dummyEmail = `${phone}@phone.scanezy.com`;
        const dummyPassword = "phone-auth-" + phone;
        
        // Try to sign in first
        try {
          await signInWithEmail(dummyEmail, dummyPassword);
        } catch (signInError) {
          // If sign in fails, try to sign up
          try {
            const { data, error } = await supabase.auth.signUp({
              email: dummyEmail,
              password: dummyPassword,
              options: {
                data: {
                  name: name || `User ${phone.slice(-4)}`,
                  phone: phone,
                  auth_method: "phone"
                }
              }
            });
            
            if (error) throw error;
            
            // Create user record
            if (data.user) {
              await supabase
                .from("users")
                .insert({
                  id: data.user.id,
                  email: dummyEmail,
                  phone: phone,
                  full_name: name || `User ${phone.slice(-4)}`,
                  role: "customer",
                  auth_provider: "phone",
                  auth_provider_id: data.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          } catch (signUpError) {
            throw signUpError;
          }
        }
        
        router.push(callbackUrl);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      setError("Authentication failed. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmail(email, password);
      router.push(callbackUrl);
    } catch (error: any) {
      setError(error.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      // The redirect will happen automatically after successful auth
    } catch (error: any) {
      setError(error.message || "Google sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to ScanEzy</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Auth method selection */}
          {step === "phone" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthMethod("email");
                    setStep("email");
                  }}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={sendOTP} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn} 
                disabled={loading} 
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          )}

          {/* Email sign in */}
          {step === "email" && (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep("phone");
                  setAuthMethod("phone");
                }}
                className="p-0 h-auto"
              >
                ← Back to phone
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleEmailSignIn} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          )}

          {/* OTP verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                OTP sent to {phone}
                <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setStep("phone")}>
                  Change number
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500">
                  For demo purposes, use OTP: <strong>123456</strong>
                </p>
              </div>
              <Button onClick={verifyOTP} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

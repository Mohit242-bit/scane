"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Building2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function DoctorOnboarding() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [doctorData, setDoctorData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    license_number: ""
  });

  useEffect(() => {
    checkAuthAndUser();
  }, []);

  const checkAuthAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/partner/login");
        return;
      }

      setUser(user);
      
      // Pre-fill data from Google OAuth
      setDoctorData(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || ""
      }));

    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/partner/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorData.full_name || !doctorData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      setError("");

      // Create a basic partner profile so they can access the dashboard
      const { error: profileError } = await supabase
        .from("partners")
        .insert({
          user_id: user.id,
          business_name: `Dr. ${doctorData.full_name}`,
          business_email: user.email,
          business_phone: doctorData.phone,
          address: `${doctorData.specialization || "Medical Professional"}`,
          city: "Not specified",
          status: "pending"
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Failed to create doctor profile: " + profileError.message);
      }

      // Update user role to doctor/partner
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ role: "partner" })
        .eq("id", user.id);

      if (userUpdateError) {
        console.error("User update error:", userUpdateError);
      }

      toast({
        title: "Success!",
        description: "Your doctor profile has been created. Redirecting to dashboard..."
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/partner/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error("Onboarding error:", error);
      setError(error.message || "Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-[#0AA1A7] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#0B1B2B] mb-2"> Welcome, Doctor!</h1>
          <p className="text-lg text-[#5B6B7A]">
            Complete your profile to start reviewing prescriptions
          </p>
        </div>

        {/* Quick Setup Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0AA1A7] to-[#089098] text-white">
            <CardTitle className="text-2xl">Quick Setup</CardTitle>
            <CardDescription className="text-white/90">
              Just a few details to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={doctorData.full_name}
                  onChange={(e) => setDoctorData({ ...doctorData, full_name: e.target.value })}
                  placeholder="Dr. John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={doctorData.phone}
                  onChange={(e) => setDoctorData({ ...doctorData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization (Optional)</Label>
                <Input
                  id="specialization"
                  value={doctorData.specialization}
                  onChange={(e) => setDoctorData({ ...doctorData, specialization: e.target.value })}
                  placeholder="e.g., Radiology, General Medicine"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">Medical License Number (Optional)</Label>
                <Input
                  id="license_number"
                  value={doctorData.license_number}
                  onChange={(e) => setDoctorData({ ...doctorData, license_number: e.target.value })}
                  placeholder="Your medical license number"
                  disabled={loading}
                />
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  After setup, you'll be able to:
                  <ul className="mt-2 ml-4 list-disc text-sm">
                    <li>View prescription uploads from patients</li>
                    <li>Recommend diagnostic tests</li>
                    <li>Send recommendations via email</li>
                    <li>Manage multiple medical centers</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/partner/login")}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !doctorData.full_name || !doctorData.phone}
                  className="flex-1 bg-[#0AA1A7] hover:bg-[#089098]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your profile will be reviewed by our admin team. 
            You can start using the dashboard immediately, but some features may require admin approval.
          </p>
        </div>
      </div>
    </div>
  );
}

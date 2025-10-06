"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function PartnerDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    address: "",
    city: ""
  });

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      
      // Check if user has partner role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (userData?.role !== "partner") {
        toast({
          title: "Access Denied",
          description: "You need to sign up as a partner first",
          variant: "destructive"
        });
        router.push("/partner-us");
        return;
      }
      
      // Load existing partner data if any
      const { data: existingPartner } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (existingPartner) {
        setPartnerData(existingPartner);
        setFormData({
          business_name: existingPartner.business_name || "",
          business_email: existingPartner.business_email || "",
          business_phone: existingPartner.business_phone || "",
          address: existingPartner.address || "",
          city: existingPartner.city || ""
        });
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least business name and city",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (partnerData) {
        // Update existing partner
        const { error } = await supabase
          .from("partners")
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq("id", partnerData.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Partner details updated successfully!"
        });
      } else {
        // Create new partner entry
        const { error } = await supabase
          .from("partners")
          .insert({
            user_id: user.id,
            ...formData,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Partner details saved successfully!"
        });
      }
      
      // Redirect to partner dashboard
      router.push("/partner/dashboard");
      
    } catch (error: any) {
      console.error("Error saving partner data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save partner details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Checking your partner status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-[#0AA1A7]/10 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-[#0AA1A7]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0B1B2B]">
              Partner Center Details
            </CardTitle>
            <CardDescription>
              {partnerData ? "Update your medical center information" : "Enter your medical center information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User info display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Logged in as:</span>
                </div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3" />
                  Partner Account
                </p>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business_name">
                    Medical Center Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    placeholder="Enter your medical center name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_email">Business Email</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => setFormData({...formData, business_email: e.target.value})}
                      placeholder="contact@center.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input
                      id="business_phone"
                      type="tel"
                      value={formData.business_phone}
                      onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter complete address of your medical center"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              {partnerData && (
                <Alert>
                  <AlertDescription>
                    Status: <span className="font-medium capitalize">{partnerData.status}</span>
                    {partnerData.status === "pending" && " - Your application is under review"}
                    {partnerData.status === "approved" && " - You can manage your centers"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#0AA1A7] hover:bg-[#089098]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : partnerData ? "Update Details" : "Save Details"}
                </Button>
                {partnerData?.status === "approved" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/partner/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
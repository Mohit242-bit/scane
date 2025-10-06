"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  MapPin, 
  FileText, 
  Clock, 
  LogOut,
  Eye,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Center {
  id: number
  name: string
  address: string
  city: string
  area_hint: string
}

interface Prescription {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  prescription_files: any[]
  notes: string
  status: string
  created_at: string
  center: Center
  recommendations: any[]
}

interface Service {
  id: number
  name: string
  description: string
  price: number
  modality: string
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  
  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (selectedCenter) {
      fetchPrescriptions();
    }
  }, [selectedCenter]);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push("/partner/login");
        return;
      }

      setUser(authUser);
      await fetchCenters();
      await fetchServices();
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/partner/login");
    }
  };

  const fetchCenters = async () => {
    try {
      setLoading(true);
      
      // Fetch all centers
      const { data: centersData, error } = await supabase
        .from("centers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      setCenters(centersData || []);
      
      // Auto-select first center if available
      if (centersData && centersData.length > 0) {
        setSelectedCenter(centersData[0].id);
      }
    } catch (error: any) {
      console.error("Fetch centers error:", error);
      toast({
        title: "Error",
        description: "Failed to load centers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data: servicesData, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) throw error;
      setServices(servicesData || []);
    } catch (error) {
      console.error("Fetch services error:", error);
    }
  };

  const fetchPrescriptions = async () => {
    if (!selectedCenter) return;

    try {
      setLoadingPrescriptions(true);

      const response = await fetch(`/api/prescriptions?center_id=${selectedCenter}`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch prescriptions");

      const data = await response.json();
      setPrescriptions(data.prescriptions || []);
    } catch (error) {
      console.error("Fetch prescriptions error:", error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive"
      });
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/partner/login");
  };

  const openReviewDialog = (prescription: Prescription) => {
    setCurrentPrescription(prescription);
    setSelectedTests([]);
    setDoctorNotes("");
    setReviewDialogOpen(true);
  };

  const toggleTestSelection = (serviceId: number) => {
    setSelectedTests(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmitRecommendation = async () => {
    if (!currentPrescription || selectedTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const selectedServices = services.filter(s => selectedTests.includes(s.id));
      const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0);

      const response = await fetch("/api/test-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          prescription_id: currentPrescription.id,
          service_ids: selectedTests,
          recommended_tests: selectedServices.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            modality: s.modality
          })),
          doctor_notes: doctorNotes,
          total_estimated_cost: totalCost,
          send_email: true
        })
      });

      if (!response.ok) throw new Error("Failed to submit recommendation");

      toast({
        title: "Success",
        description: "Test recommendation sent to patient via email"
      });

      setReviewDialogOpen(false);
      fetchPrescriptions(); // Refresh list
    } catch (error) {
      console.error("Submit recommendation error:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendation",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pending Review", variant: "secondary" },
      reviewed: { label: "Reviewed", variant: "default" },
      recommended: { label: "Recommended", variant: "default" },
      completed: { label: "Completed", variant: "outline" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0AA1A7] mx-auto mb-4" />
          <p className="text-[#5B6B7A]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0AA1A7] to-[#089098] shadow-lg border-b">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">👨‍⚕️ Doctor Dashboard</h1>
                <p className="text-white/90 text-lg">Review prescriptions and recommend tests</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-white hover:bg-gray-100">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Center Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Medical Center
            </CardTitle>
            <CardDescription>
              Choose a center to view prescription uploads from that location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {centers.map((center) => (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenter(center.id)}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedCenter === center.id 
                      ? "border-[#0AA1A7] bg-[#0AA1A7]/5" 
                      : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <h3 className="font-semibold text-lg mb-1">{center.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{center.area_hint || center.city}</span>
                  </div>
                  {selectedCenter === center.id && (
                    <div className="mt-2">
                      <Badge variant="default">Selected</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {centers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No centers available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        {selectedCenter && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prescription Uploads</CardTitle>
                  <CardDescription>
                    Review patient prescriptions and recommend appropriate tests
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchPrescriptions}
                  disabled={loadingPrescriptions}
                >
                  {loadingPrescriptions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Pending ({prescriptions.filter(p => p.status === "pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="recommended">
                    Recommended ({prescriptions.filter(p => p.status === "recommended").length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All ({prescriptions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {prescriptions
                    .filter(p => p.status === "pending")
                    .map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        onReview={openReviewDialog}
                      />
                    ))}
                  {prescriptions.filter(p => p.status === "pending").length === 0 && (
                    <EmptyState message="No pending prescriptions" />
                  )}
                </TabsContent>

                <TabsContent value="recommended" className="space-y-4">
                  {prescriptions
                    .filter(p => p.status === "recommended")
                    .map((prescription) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        onReview={openReviewDialog}
                      />
                    ))}
                  {prescriptions.filter(p => p.status === "recommended").length === 0 && (
                    <EmptyState message="No recommended prescriptions" />
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <PrescriptionCard
                      key={prescription.id}
                      prescription={prescription}
                      onReview={openReviewDialog}
                    />
                  ))}
                  {prescriptions.length === 0 && (
                    <EmptyState message="No prescriptions found" />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Prescription & Recommend Tests</DialogTitle>
            <DialogDescription>
              Select appropriate tests for the patient
            </DialogDescription>
          </DialogHeader>

          {currentPrescription && (
            <div className="space-y-6 py-4">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{currentPrescription.patient_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{currentPrescription.patient_email}</span>
                  </div>
                  {currentPrescription.patient_phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{currentPrescription.patient_phone}</span>
                    </div>
                  )}
                </div>
                {currentPrescription.notes && (
                  <div className="mt-3">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1">{currentPrescription.notes}</p>
                  </div>
                )}
              </div>

              {/* Prescription Files */}
              {currentPrescription.prescription_files && currentPrescription.prescription_files.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Uploaded Prescriptions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {currentPrescription.prescription_files.map((file: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <FileText className="h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-sm font-medium">{file.name || `Prescription ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Recommended Tests</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${selectedTests.includes(service.id) 
                          ? "border-[#0AA1A7] bg-[#0AA1A7]/5" 
                          : "border-gray-200 hover:border-gray-300"}
                      `}
                      onClick={() => toggleTestSelection(service.id)}
                    >
                      <Checkbox 
                        checked={selectedTests.includes(service.id)}
                        onCheckedChange={() => toggleTestSelection(service.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          <span className="text-[#0AA1A7] font-semibold">₹{service.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {service.modality}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTests.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Estimated Cost:</span>
                      <span className="text-xl font-bold text-[#0AA1A7]">
                        ₹{services
                          .filter(s => selectedTests.includes(s.id))
                          .reduce((sum, s) => sum + s.price, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTests.length} test(s) selected
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor Notes */}
              <div>
                <Label htmlFor="doctor_notes">Doctor's Notes (Optional)</Label>
                <Textarea
                  id="doctor_notes"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add any additional notes or instructions for the patient..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRecommendation}
                  disabled={submitting || selectedTests.length === 0}
                  className="flex-1 bg-[#0AA1A7] hover:bg-[#089098]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Recommendation via Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prescription Card Component
function PrescriptionCard({ 
  prescription, 
  onReview 
}: { 
  prescription: Prescription
  onReview: (p: Prescription) => void 
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pending Review", variant: "secondary" },
      reviewed: { label: "Reviewed", variant: "default" },
      recommended: { label: "Recommended", variant: "default" },
      completed: { label: "Completed", variant: "outline" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
          <p className="text-sm text-gray-600">{prescription.patient_email}</p>
        </div>
        {getStatusBadge(prescription.status)}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatDate(prescription.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{prescription.prescription_files?.length || 0} file(s)</span>
        </div>
      </div>

      {prescription.notes && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          <span className="font-medium">Notes:</span> {prescription.notes}
        </p>
      )}

      {prescription.recommendations && prescription.recommendations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Tests Recommended</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Total Cost: ₹{prescription.recommendations[0]?.total_estimated_cost?.toLocaleString()}
          </p>
        </div>
      )}

      <Button
        variant={prescription.status === "pending" ? "default" : "outline"}
        size="sm"
        onClick={() => onReview(prescription)}
        className="w-full"
      >
        <Eye className="h-4 w-4 mr-2" />
        {prescription.status === "pending" ? "Review & Recommend" : "View Details"}
      </Button>
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

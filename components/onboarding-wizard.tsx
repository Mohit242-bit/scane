"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import supabase from "@/lib/supabaseClient"

const steps = [
  { id: 1, title: "Business Information", description: "Tell us about your business" },
  { id: 2, title: "Center Details", description: "Add your center information" },
  { id: 3, title: "Services & Pricing", description: "Configure your services" },
  { id: 4, title: "Verification", description: "Complete your setup" }
]

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Form data
  const [businessData, setBusinessData] = useState({
    business_name: "",
    business_registration_number: "",
    gst_number: "",
    pan_number: "",
    phone: "",
    full_name: ""
  })

  const [centerData, setCenterData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    area_hint: "",
    phone: "",
    email: "",
    website: "",
    license_number: "",
    amenities: [] as string[],
    operating_hours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "09:00", close: "18:00", closed: true }
    }
  })

  const [selectedServices, setSelectedServices] = useState<any[]>([])

  const availableServices = [
    { id: "xray", name: "X-Ray", category: "Imaging", price: 800 },
    { id: "ct-scan", name: "CT Scan", category: "Imaging", price: 4500 },
    { id: "mri", name: "MRI", category: "Imaging", price: 8000 },
    { id: "ultrasound", name: "Ultrasound", category: "Imaging", price: 2500 },
    { id: "blood-test", name: "Blood Tests", category: "Laboratory", price: 500 },
    { id: "ecg", name: "ECG/EKG", category: "Cardiology", price: 300 },
  ]

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBusinessSubmit = async () => {
    if (!businessData.business_name || !businessData.phone) {
      setError("Please fill in all required fields")
      return
    }
    setError("")
    nextStep()
  }

  const handleCenterSubmit = async () => {
    if (!centerData.name || !centerData.address || !centerData.city) {
      setError("Please fill in all required fields")
      return
    }
    setError("")
    nextStep()
  }

  const handleServicesSubmit = async () => {
    if (selectedServices.length === 0) {
      setError("Please select at least one service")
      return
    }
    setError("")
    nextStep()
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("Not authenticated")

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("No session")

      // 1. Create partner profile
      const profileResponse = await fetch("/api/partner/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(businessData)
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to create partner profile")
      }

      // 2. Create center
      const centerResponse = await fetch("/api/partner/centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(centerData)
      })

      if (!centerResponse.ok) {
        throw new Error("Failed to create center")
      }

      const { center } = await centerResponse.json()

      // 3. Add services to center
      for (const service of selectedServices) {
        await supabase
          .from("center_services")
          .insert({
            center_id: center.id,
            service_id: service.id,
            price: service.price,
            is_available: true
          })
      }

      toast({
        title: "Onboarding Complete!",
        description: "Welcome to Scanezy partner program.",
      })

      router.push("/partner/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-4">Partner Onboarding</h1>
          <p className="text-[#5B6B7A]">Let's get your radiology center set up on Scanezy</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <div>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </div>
              <div className="text-sm text-[#5B6B7A]">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={businessData.full_name}
                      onChange={(e) => setBusinessData({ ...businessData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={businessData.business_name}
                    onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                    placeholder="Your radiology center name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={businessData.gst_number}
                      onChange={(e) => setBusinessData({ ...businessData, gst_number: e.target.value })}
                      placeholder="27AAPFU0939F1ZV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={businessData.pan_number}
                      onChange={(e) => setBusinessData({ ...businessData, pan_number: e.target.value })}
                      placeholder="AAPFU0939F"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_registration">Business Registration Number</Label>
                  <Input
                    id="business_registration"
                    value={businessData.business_registration_number}
                    onChange={(e) => setBusinessData({ ...businessData, business_registration_number: e.target.value })}
                    placeholder="Company registration number"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleBusinessSubmit} disabled={loading}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Center Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="center_name">Center Name *</Label>
                  <Input
                    id="center_name"
                    value={centerData.name}
                    onChange={(e) => setCenterData({ ...centerData, name: e.target.value })}
                    placeholder="e.g., City Scan Center"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={centerData.description}
                    onChange={(e) => setCenterData({ ...centerData, description: e.target.value })}
                    placeholder="Brief description of your center and services"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={centerData.address}
                    onChange={(e) => setCenterData({ ...centerData, address: e.target.value })}
                    placeholder="Full address with landmarks"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={centerData.city}
                      onChange={(e) => setCenterData({ ...centerData, city: e.target.value })}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={centerData.state}
                      onChange={(e) => setCenterData({ ...centerData, state: e.target.value })}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={centerData.pincode}
                      onChange={(e) => setCenterData({ ...centerData, pincode: e.target.value })}
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="center_phone">Phone</Label>
                    <Input
                      id="center_phone"
                      value={centerData.phone}
                      onChange={(e) => setCenterData({ ...centerData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="center_email">Email</Label>
                    <Input
                      id="center_email"
                      type="email"
                      value={centerData.email}
                      onChange={(e) => setCenterData({ ...centerData, email: e.target.value })}
                      placeholder="info@center.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="license_number">Medical License Number</Label>
                  <Input
                    id="license_number"
                    value={centerData.license_number}
                    onChange={(e) => setCenterData({ ...centerData, license_number: e.target.value })}
                    placeholder="License number"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={handleCenterSubmit} disabled={loading}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Services You Offer</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {availableServices.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedServices.find(s => s.id === service.id)
                            ? "border-[#0AA1A7] bg-[#0AA1A7]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          if (selectedServices.find(s => s.id === service.id)) {
                            setSelectedServices(selectedServices.filter(s => s.id !== service.id))
                          } else {
                            setSelectedServices([...selectedServices, service])
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                          <p className="font-medium">₹{service.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={handleServicesSubmit} disabled={loading}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Business Information</h4>
                      <p><strong>Business:</strong> {businessData.business_name}</p>
                      <p><strong>Contact:</strong> {businessData.full_name} • {businessData.phone}</p>
                      {businessData.gst_number && <p><strong>GST:</strong> {businessData.gst_number}</p>}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Center Details</h4>
                      <p><strong>Name:</strong> {centerData.name}</p>
                      <p><strong>Address:</strong> {centerData.address}, {centerData.city}</p>
                      {centerData.phone && <p><strong>Phone:</strong> {centerData.phone}</p>}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Services ({selectedServices.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                          <span key={service.id} className="px-2 py-1 bg-[#0AA1A7] text-white text-sm rounded">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={handleFinalSubmit} disabled={loading}>
                    {loading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

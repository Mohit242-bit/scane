"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Camera,
  Wifi,
  Car,
  Accessibility,
  Coffee
} from "lucide-react"
import { createClient } from "@/lib/supabase-browser"

interface OnboardingStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function PartnerOnboarding() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

  // Partner basic info
  const [partnerData, setPartnerData] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    address: "",
    city: ""
  })

  // Center info
  const [centerData, setCenterData] = useState({
    name: "",
    address: "",
    city: "",
    area_hint: "",
    phone: "",
    email: ""
  })

  // Operating hours
  const [operatingHours, setOperatingHours] = useState({
    monday: { start: "09:00", end: "18:00", closed: false },
    tuesday: { start: "09:00", end: "18:00", closed: false },
    wednesday: { start: "09:00", end: "18:00", closed: false },
    thursday: { start: "09:00", end: "18:00", closed: false },
    friday: { start: "09:00", end: "18:00", closed: false },
    saturday: { start: "09:00", end: "17:00", closed: false },
    sunday: { start: "10:00", end: "16:00", closed: true }
  })

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  // Services
  const [services, setServices] = useState<any[]>([])
  const [currentService, setCurrentService] = useState({
    name: "",
    description: "",
    modality: "",
    price: "",
    duration_minutes: "30"
  })
  
  const availableAmenities = [
    { id: "parking", label: "Parking", icon: Car },
    { id: "wifi", label: "Free WiFi", icon: Wifi },
    { id: "ac", label: "AC Waiting Area", icon: Coffee },
    { id: "wheelchair", label: "Wheelchair Access", icon: Accessibility },
    { id: "cafe", label: "Cafeteria", icon: Coffee },
    { id: "pharmacy", label: "Pharmacy", icon: Building2 }
  ]

  const steps: OnboardingStep[] = [
    { id: 1, title: "Business Information", description: "Tell us about your business", completed: false },
    { id: 2, title: "Center Details", description: "Add your medical center information", completed: false },
    { id: 3, title: "Operating Hours", description: "Set your working hours", completed: false },
    { id: 4, title: "Services Offered", description: "What services do you provide?", completed: false },
    { id: 5, title: "Amenities & Features", description: "What facilities do you offer?", completed: false },
    { id: 6, title: "Review & Submit", description: "Review and complete setup", completed: false }
  ]

  useEffect(() => {
    checkAuthAndUser()
  }, [])

  const checkAuthAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/partner/login")
        return
      }

      setUser(user)

      // Check if partner profile already exists
      const { data: partnerExists } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (partnerExists) {
        // Partner already onboarded, redirect to dashboard
        router.push("/partner/dashboard")
        return
      }

      // Pre-fill some data from Google OAuth
      setPartnerData(prev => ({
        ...prev,
        business_email: user.email || "",
      }))

    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/partner/login")
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(partnerData.business_name && partnerData.business_email && partnerData.business_phone && partnerData.address && partnerData.city)
      case 2:
        return !!(centerData.name && centerData.address && centerData.city && centerData.phone && centerData.email)
      case 3:
        return true // Operating hours always valid
      case 4:
        return services.length > 0
      case 5:
        return selectedAmenities.length > 0
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
      setError("")
    } else {
      setError("Please fill in all required fields before proceeding")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError("")
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError("")

      // Use the partner profile API endpoint
      const profileResponse = await fetch('/api/partner/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          business_name: partnerData.business_name,
          business_email: partnerData.business_email,
          business_phone: partnerData.business_phone,
          address: partnerData.address,
          city: partnerData.city
        })
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Failed to create partner profile')
      }

      const partnerProfile = await profileResponse.json()

      // Use the centers API endpoint
      const centerResponse = await fetch('/api/partner/centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          name: centerData.name,
          address: centerData.address,
          city: centerData.city,
          area_hint: centerData.area_hint,
          phone: centerData.phone,
          email: centerData.email,
          operating_hours: operatingHours,
          amenities: selectedAmenities
        })
      })

      if (!centerResponse.ok) {
        const errorData = await centerResponse.json()
        throw new Error(errorData.error || 'Failed to create center')
      }

      // Create services
      const session = await supabase.auth.getSession()
      const authToken = session.data.session?.access_token
      
      const servicePromises = services.map(service => 
        fetch('/api/partner/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            name: service.name,
            description: service.description,
            modality: service.modality,
            price: service.price,
            duration_minutes: service.duration_minutes
          })
        })
      )

      const serviceResponses = await Promise.all(servicePromises)
      
      // Check if any service creation failed
      for (const response of serviceResponses) {
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create services')
        }
      }

      toast({
        title: "Onboarding completed!",
        description: "Your partner account has been created successfully. You can now access your dashboard."
      })

      router.push("/partner/dashboard")
    } catch (error: any) {
      console.error("Onboarding error:", error)
      setError(error.message || "Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const addService = () => {
    if (currentService.name && currentService.modality && currentService.price) {
      setServices(prev => [...prev, { ...currentService, id: Date.now() }])
      setCurrentService({
        name: "",
        description: "",
        modality: "",
        price: "",
        duration_minutes: "30"
      })
    }
  }

  const removeService = (serviceId: number) => {
    setServices(prev => prev.filter(s => s.id !== serviceId))
  }

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={partnerData.business_name}
                  onChange={(e) => setPartnerData(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="MedScan Diagnostics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_email">Business Email *</Label>
                <Input
                  id="business_email"
                  type="email"
                  value={partnerData.business_email}
                  onChange={(e) => setPartnerData(prev => ({ ...prev, business_email: e.target.value }))}
                  placeholder="contact@medscan.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_phone">Business Phone *</Label>
              <Input
                id="business_phone"
                type="tel"
                value={partnerData.business_phone}
                onChange={(e) => setPartnerData(prev => ({ ...prev, business_phone: e.target.value }))}
                placeholder="+91-9876543210"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={partnerData.address}
                  onChange={(e) => setPartnerData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={partnerData.city}
                  onChange={(e) => setPartnerData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Pune"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="center_name">Center Name *</Label>
              <Input
                id="center_name"
                value={centerData.name}
                onChange={(e) => setCenterData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="MedScan Koregaon Park"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="center_address">Center Address *</Label>
                <Input
                  id="center_address"
                  value={centerData.address}
                  onChange={(e) => setCenterData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 North Main Road"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center_city">City *</Label>
                <Input
                  id="center_city"
                  value={centerData.city}
                  onChange={(e) => setCenterData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Pune"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_hint">Area Landmark</Label>
              <Input
                id="area_hint"
                value={centerData.area_hint}
                onChange={(e) => setCenterData(prev => ({ ...prev, area_hint: e.target.value }))}
                placeholder="Near Osho Ashram, Koregaon Park"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="center_phone">Center Phone *</Label>
                <Input
                  id="center_phone"
                  type="tel"
                  value={centerData.phone}
                  onChange={(e) => setCenterData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91-9876543211"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center_email">Center Email *</Label>
                <Input
                  id="center_email"
                  type="email"
                  value={centerData.email}
                  onChange={(e) => setCenterData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="koregaon@medscan.com"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Set your operating hours for each day of the week
            </div>
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24 font-medium capitalize">{day}</div>
                <div className="flex items-center gap-2 flex-1">
                  {hours.closed ? (
                    <Badge variant="secondary">Closed</Badge>
                  ) : (
                    <>
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) => updateOperatingHours(day, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) => updateOperatingHours(day, 'end', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateOperatingHours(day, 'closed', !hours.closed)}
                >
                  {hours.closed ? 'Open' : 'Close'}
                </Button>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Add the medical services your center provides
            </div>
            
            {/* Add Service Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_name">Service Name *</Label>
                    <Input
                      id="service_name"
                      value={currentService.name}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="X-Ray Chest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_modality">Modality *</Label>
                    <Input
                      id="service_modality"
                      value={currentService.modality}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, modality: e.target.value }))}
                      placeholder="X-Ray, MRI, CT Scan, etc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_price">Price (₹) *</Label>
                    <Input
                      id="service_price"
                      type="number"
                      value={currentService.price}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_duration">Duration (minutes)</Label>
                    <Input
                      id="service_duration"
                      type="number"
                      value={currentService.duration_minutes}
                      onChange={(e) => setCurrentService(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_description">Description</Label>
                  <Textarea
                    id="service_description"
                    value={currentService.description}
                    onChange={(e) => setCurrentService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the service..."
                    rows={2}
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={addService}
                  disabled={!currentService.name || !currentService.modality || !currentService.price}
                  className="w-full"
                >
                  Add Service
                </Button>
              </CardContent>
            </Card>

            {/* Services List */}
            {services.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-[#0B1B2B]">Added Services ({services.length})</h4>
                <div className="space-y-2">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">
                            {service.modality} • ₹{service.price} • {service.duration_minutes} mins
                          </div>
                          {service.description && (
                            <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(service.id)}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {services.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please add at least one service to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Select the amenities and facilities available at your center
            </div>
            <div className="grid grid-cols-2 gap-4">
              {availableAmenities.map((amenity) => {
                const Icon = amenity.icon
                const isSelected = selectedAmenities.includes(amenity.id)
                return (
                  <Card
                    key={amenity.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-[#0AA1A7] bg-[#0AA1A7]/5' : ''
                    }`}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-[#0AA1A7]' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isSelected ? 'text-[#0AA1A7]' : ''}`}>
                        {amenity.label}
                      </span>
                      {isSelected && <CheckCircle className="h-5 w-5 text-[#0AA1A7] ml-auto" />}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {selectedAmenities.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one amenity to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review your information before submitting. You can edit these details later from your dashboard.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Business Name:</strong> {partnerData.business_name}</div>
                <div><strong>Email:</strong> {partnerData.business_email}</div>
                <div><strong>Phone:</strong> {partnerData.business_phone}</div>
                <div><strong>Address:</strong> {partnerData.address}, {partnerData.city}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Center Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Center Name:</strong> {centerData.name}</div>
                <div><strong>Address:</strong> {centerData.address}, {centerData.city}</div>
                <div><strong>Area Hint:</strong> {centerData.area_hint || "Not provided"}</div>
                <div><strong>Phone:</strong> {centerData.phone}</div>
                <div><strong>Email:</strong> {centerData.email}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services ({services.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <div key={service.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">
                        {service.modality} • ₹{service.price} • {service.duration_minutes} minutes
                      </div>
                      {service.description && (
                        <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map(amenityId => {
                    const amenity = availableAmenities.find(a => a.id === amenityId)
                    return amenity ? (
                      <Badge key={amenityId} variant="secondary">
                        {amenity.label}
                      </Badge>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Welcome to Scanezy!</h1>
          <p className="text-lg text-[#5B6B7A]">
            Let's set up your medical center and get you started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-[#0AA1A7] border-[#0AA1A7] text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-[#0AA1A7]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-[#0AA1A7]">Step {currentStep}</span>
              <span>{steps[currentStep - 1]?.title}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep) || loading}
              className="bg-[#0AA1A7] hover:bg-[#089098]"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#0AA1A7] hover:bg-[#089098]"
            >
              {loading ? "Setting up..." : "Complete Setup"}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

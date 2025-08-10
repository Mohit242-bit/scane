"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, MapPin, Clock, IndianRupee, Calendar, User, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { services, centers } from "@/lib/data"

interface BookingData {
  serviceId: string
  centerId: string
  date: string
  time: string
  patientName: string
  patientAge: number
  patientGender: "male" | "female" | "other"
  patientPhone: string
  patientEmail: string
  notes: string
}

export default function BookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const preSelectedService = searchParams.get("service")
  const preSelectedCenter = searchParams.get("center")

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: preSelectedService || "",
    centerId: preSelectedCenter || "",
    date: "",
    time: "",
    patientName: "",
    patientAge: 0,
    patientGender: "male",
    patientPhone: "",
    patientEmail: "",
    notes: "",
  })

  const availableCenters = bookingData.serviceId
    ? centers.filter((center) => center.services.includes(bookingData.serviceId))
    : centers

  const selectedService = services.find((s) => s.id === bookingData.serviceId)
  const selectedCenter = centers.find((c) => c.id === bookingData.centerId)

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ]

  const handleNext = () => {
    setError("")

    if (step === 1 && !bookingData.serviceId) {
      setError("Please select a service")
      return
    }
    if (step === 2 && !bookingData.centerId) {
      setError("Please select a center")
      return
    }
    if (step === 3 && (!bookingData.date || !bookingData.time)) {
      setError("Please select date and time")
      return
    }
    if (step === 4) {
      if (!bookingData.patientName || !bookingData.patientAge || !bookingData.patientPhone) {
        setError("Please fill in all required fields")
        return
      }
      handleBooking()
      return
    }

    setStep(step + 1)
  }

  const handleBooking = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          totalAmount: selectedService?.price || 0,
        }),
      })

      if (response.ok) {
        const booking = await response.json()
        toast({
          title: "Booking Confirmed!",
          description: "Your appointment has been booked successfully",
        })
        router.push(`/confirm/${booking.id}`)
      } else {
        setError("Failed to create booking. Please try again.")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: "Select Service", completed: !!bookingData.serviceId },
    { id: 2, title: "Choose Center", completed: !!bookingData.centerId },
    { id: 3, title: "Pick Date & Time", completed: !!bookingData.date && !!bookingData.time },
    { id: 4, title: "Patient Details", completed: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepItem.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}
                `}
                >
                  {stepItem.completed ? <CheckCircle className="h-4 w-4" /> : stepItem.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                    w-16 h-1 mx-2
                    ${step > stepItem.id ? "bg-blue-600" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            {steps.map((stepItem) => (
              <span key={stepItem.id} className={step >= stepItem.id ? "text-blue-600" : "text-gray-500"}>
                {stepItem.title}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && (
                <>
                  <Calendar className="h-5 w-5" /> Select Service
                </>
              )}
              {step === 2 && (
                <>
                  <MapPin className="h-5 w-5" /> Choose Center
                </>
              )}
              {step === 3 && (
                <>
                  <Clock className="h-5 w-5" /> Pick Date & Time
                </>
              )}
              {step === 4 && (
                <>
                  <User className="h-5 w-5" /> Patient Information
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Choose the radiology service you need"}
              {step === 2 && "Select a diagnostic center near you"}
              {step === 3 && "Pick your preferred appointment slot"}
              {step === 4 && "Provide patient details for the appointment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <RadioGroup
                  value={bookingData.serviceId}
                  onValueChange={(value) => setBookingData({ ...bookingData, serviceId: value, centerId: "" })}
                >
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <RadioGroupItem value={service.id} id={service.id} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                              {service.name}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary">{service.category}</Badge>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-lg font-bold text-blue-600">
                              <IndianRupee className="h-4 w-4" />
                              {service.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Center Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <RadioGroup
                  value={bookingData.centerId}
                  onValueChange={(value) => setBookingData({ ...bookingData, centerId: value })}
                >
                  {availableCenters.map((center) => (
                    <div key={center.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={center.id} id={center.id} />
                      <div className="flex-1">
                        <Label htmlFor={center.id} className="text-base font-medium cursor-pointer">
                          {center.name}
                        </Label>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {center.address}, {center.city}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-yellow-600">★ {center.rating}</span>
                            <span className="text-sm text-gray-500">{center.phone}</span>
                          </div>
                          <p className="text-xs text-gray-500">{center.timings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Date & Time Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="date" className="text-base font-medium">
                    Select Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Select Time</Label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={bookingData.time === time ? "default" : "outline"}
                        onClick={() => setBookingData({ ...bookingData, time })}
                        className="h-12"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Details */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={bookingData.patientName}
                      onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientAge">Age *</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={bookingData.patientAge || ""}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, patientAge: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="Enter age"
                    />
                  </div>
                </div>

                <div>
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={bookingData.patientGender}
                    onValueChange={(value: "male" | "female" | "other") =>
                      setBookingData({ ...bookingData, patientGender: value })
                    }
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientPhone">Phone Number *</Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={bookingData.patientPhone}
                      onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail">Email Address</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={bookingData.patientEmail}
                      onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any special instructions or medical conditions"
                    rows={3}
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Center:</span>
                      <span>{selectedCenter?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span>
                        {bookingData.date} at {bookingData.time}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                      <span>Total Amount:</span>
                      <span className="flex items-center text-blue-600">
                        <IndianRupee className="h-4 w-4" />
                        {selectedService?.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={loading} className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : step === 4 ? (
                  "Confirm Booking"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

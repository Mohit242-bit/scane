"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Check, MapPin, ShieldCheck, Timer, Zap, AlertCircle } from "lucide-react"
import { servicesSeed, citiesSeed, seededCentersFor } from "@/lib/data"
import type { Center, Service, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/events"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "@/components/loading-spinner"
import ErrorBoundary from "@/components/error-boundary"
import RazorpayPayment from "@/components/razorpay-payment"

type FlowProps = {
  defaultService?: string
  defaultCity?: string
  defaultWhen?: string
}

export default function BookingFlow({
  defaultService = "mri-brain",
  defaultCity = "mumbai",
  defaultWhen = "soonest",
}: FlowProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const services = useMemo(() => servicesSeed(), [])
  const cities = useMemo(() => citiesSeed(), [])
  const [serviceSlug, setServiceSlug] = useState(defaultService)
  const [citySlug, setCitySlug] = useState(defaultCity)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<Slot[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  // Step state: 1 select, 2 auth, 3 pay
  const [step, setStep] = useState(1)

  // Booking
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [holdTimer, setHoldTimer] = useState<number>(0)
  const holdTimerRef = useRef<number | null>(null)
  const holdExpiresAtRef = useRef<number | null>(null)

  const chosenService: Service | undefined = services.find((s) => s.slug === serviceSlug)
  const city = cities.find((c) => c.slug === citySlug)

  useEffect(() => {
    // Track service view
    if (chosenService) {
      trackEvent("service_viewed", {
        service_id: chosenService.id,
        city: citySlug,
      })
    }
  }, [chosenService, citySlug])

  useEffect(() => {
    // Seed centers and slots for the selected service/city window
    const centersSeeded = seededCentersFor(citySlug)
    setCenters(centersSeeded)
  }, [citySlug])

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true)
      try {
        const response = await fetch(
          `/api/slots?city=${citySlug}&service=${serviceSlug}${selectedDate ? `&date=${selectedDate.toISOString()}` : ""}`,
        )

        if (!response.ok) {
          throw new Error("Failed to load slots")
        }

        const data = await response.json()
        setSlots(data.slots || [])
        setCenters(data.centers || [])

        trackEvent("slot_checked", {
          service_id: chosenService?.id,
          city: citySlug,
          slots_found: data.slots?.length || 0,
        })
      } catch (error) {
        toast({
          title: "Error loading slots",
          description: "Please try again or contact support.",
          variant: "destructive",
        })
      } finally {
        setLoadingSlots(false)
      }
    }
    loadSlots()
  }, [citySlug, serviceSlug, selectedDate, centers, chosenService, toast])

  // Clean up hold countdown
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current)
    }
  }, [])

  // Hold timer countdown
  useEffect(() => {
    if (holdExpiresAtRef.current) {
      holdTimerRef.current = window.setInterval(() => {
        const remaining = Math.max(0, holdExpiresAtRef.current! - Date.now())
        setHoldTimer(Math.ceil(remaining / 1000))
        if (remaining <= 0) {
          window.clearInterval(holdTimerRef.current!)
          holdTimerRef.current = null
          toast({
            title: "Slot hold expired",
            description: "Please select a new slot to continue.",
            variant: "destructive",
          })
          setStep(1)
          setBookingId(null)
        }
      }, 1000)
    }
    return () => {
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current)
    }
  }, [holdExpiresAtRef.current, toast])

  const handleSlotSelection = async () => {
    if (!selectedSlot) return

    // Check if user is authenticated
    if (status === "loading") return

    if (!session) {
      // Redirect to sign in with callback
      const callbackUrl = `/book?service=${serviceSlug}&city=${citySlug}&slot=${selectedSlot.id}`
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    // Create booking and hold slot
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            phone: session.user.phone,
            name: session.user.name,
          },
          serviceSlug,
          slotId: selectedSlot.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create booking")
      }

      const data = await response.json()
      setBookingId(data.id)
      holdExpiresAtRef.current = data.holdExpiresAt

      trackEvent("booking_initiated", {
        booking_id: data.id,
        service_id: chosenService?.id,
        center_hint: centers.find((c) => c.id === selectedSlot.center_id)?.area_hint,
        price: selectedSlot.price,
        user_id: session.user.id,
      })

      setStep(3)
      toast({
        title: "Slot reserved",
        description: "You have 7 minutes to complete payment.",
      })
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    trackEvent("payment_succeeded", {
      booking_id: paymentData.bookingId,
      amount: selectedSlot?.price,
      user_id: session?.user.id,
    })

    router.push(`/confirm/${paymentData.bookingId}`)
  }

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment failed",
      description: error.message || "Please try again.",
      variant: "destructive",
    })

    trackEvent("payment_failed", {
      booking_id: bookingId,
      error: error.message,
      user_id: session?.user.id,
    })
  }

  const stepItem = (n: number, label: string) => (
    <div className="flex items-center gap-2" key={n}>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
          n === step
            ? "bg-[#0AA1A7] text-white border-[#0AA1A7]"
            : n < step
              ? "bg-[#B7F171] text-[#0B1B2B] border-[#B7F171]"
              : "bg-white text-[#5B6B7A] border-[#E5E7EB]",
        )}
        aria-current={n === step ? "step" : undefined}
      >
        {n < step ? <Check className="h-3.5 w-3.5" /> : n}
      </div>
      <div className={cn("text-sm", n <= step ? "text-[#0B1B2B]" : "text-[#5B6B7A]")}>{label}</div>
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <nav className="mb-6 flex items-center gap-3" aria-label="Breadcrumb">
          <span className="text-sm text-[#5B6B7A]">Home</span>
          <span className="text-[#5B6B7A]">/</span>
          <span className="text-sm text-[#0B1B2B] font-semibold">Book</span>
        </nav>

        <div className="mb-6 flex items-center gap-6">
          {stepItem(1, "Select service & slot")}
          <div className="h-px flex-1 bg-[#E5E7EB]" aria-hidden="true" />
          {stepItem(2, "Sign in")}
          <div className="h-px flex-1 bg-[#E5E7EB]" aria-hidden="true" />
          {stepItem(3, "Pay & confirm")}
        </div>

        {/* Step 1: Select */}
        {step === 1 && (
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Choose service and slot</CardTitle>
                <CardDescription className="text-[#5B6B7A]">
                  Soonest available shown first. Use filters to adjust.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="service">Service</Label>
                    <Select value={serviceSlug} onValueChange={setServiceSlug}>
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.slug} value={s.slug}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={citySlug} onValueChange={setCitySlug}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date (Optional)</Label>
                    <div className="rounded-md border">
                      <Calendar
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        numberOfMonths={1}
                        className="p-2"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-sm text-[#5B6B7A]">Loading slots...</span>
                  </div>
                ) : slots.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No slots available</AlertTitle>
                    <AlertDescription>Try changing date or city to see more options.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#5B6B7A]">
                        Showing {slots.length} slots • ranked by soonest, distance, rating, price
                      </div>
                      <Badge className="bg-[#B7F171] text-[#0B1B2B] hover:bg-[#A3E858]">Optimized</Badge>
                    </div>
                    <ul className="grid gap-3" role="list">
                      {slots.slice(0, 12).map((slot) => {
                        const center = centers.find((c) => c.id === slot.center_id)
                        if (!center) return null
                        const start = new Date(slot.start_ts)
                        const time = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        const dateStr = start.toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                        return (
                          <li key={slot.id}>
                            <button
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "w-full rounded-lg border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0AA1A7] hover:bg-white transition-colors",
                                selectedSlot?.id === slot.id
                                  ? "border-[#0AA1A7] ring-1 ring-[#0AA1A7] bg-[#0AA1A7]/5"
                                  : "border-[#E5E7EB]",
                              )}
                              aria-pressed={selectedSlot?.id === slot.id}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#0B1B2B]">{dateStr}</span>
                                    <span className="text-[#5B6B7A]">at</span>
                                    <span className="font-medium text-[#0B1B2B]">{time}</span>
                                    {slot.status === "OPEN" && (
                                      <span className="ml-2 inline-flex items-center rounded-md bg-[#E8FBCE] px-2 py-0.5 text-xs text-[#204400]">
                                        <Zap className="mr-1 h-3 w-3" /> Available
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-[#5B6B7A]">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {center.area_hint}, {center.city} • Rating {center.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-[#0B1B2B]">₹{slot.price}</div>
                                  <div className="text-xs text-[#5B6B7A]">TAT ~ {slot.tat_hours} h</div>
                                </div>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            <aside className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0B1B2B]">Summary</CardTitle>
                  <CardDescription className="text-[#5B6B7A]">Confirm to continue</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-sm text-[#5B6B7A]">Service</div>
                  <div className="font-medium text-[#0B1B2B]">{chosenService?.name}</div>
                  <Separator />
                  <div className="text-sm text-[#5B6B7A]">City</div>
                  <div className="font-medium text-[#0B1B2B]">{city?.name}</div>
                  <Separator />
                  <div className="text-sm text-[#5B6B7A]">Selected Slot</div>
                  {selectedSlot ? (
                    <div className="grid gap-0.5">
                      <div className="font-medium text-[#0B1B2B]">
                        {new Date(selectedSlot.start_ts).toLocaleString()}
                      </div>
                      <div className="text-sm text-[#5B6B7A]">Price ₹{selectedSlot.price}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#5B6B7A]">Not selected</div>
                  )}
                  <Button
                    disabled={!selectedSlot}
                    onClick={handleSlotSelection}
                    className="mt-2 h-11 bg-[#0AA1A7] text-white hover:bg-[#089098] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B7F171] disabled:opacity-50"
                  >
                    {session ? "Continue to Payment" : "Sign In to Continue"}
                  </Button>
                  <div className="text-xs text-[#5B6B7A]">{!session && "You'll need to sign in before booking."}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-sm text-[#5B6B7A]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0AA1A7]" />
                    <span>Secure booking with instant confirmation via WhatsApp.</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}

        {/* Step 3: Pay */}
        {step === 3 && selectedSlot && chosenService && bookingId && (
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Payment</CardTitle>
                <CardDescription className="text-[#5B6B7A]">Pay securely. We'll confirm instantly.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {holdTimer > 0 && (
                  <Alert>
                    <Timer className="h-4 w-4" />
                    <AlertTitle>
                      Slot held for {Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, "0")}
                    </AlertTitle>
                    <AlertDescription>Complete payment before the timer expires.</AlertDescription>
                  </Alert>
                )}
                <div className="rounded-md border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#0B1B2B]">{chosenService.name}</div>
                      <div className="text-sm text-[#5B6B7A]">{new Date(selectedSlot.start_ts).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[#0B1B2B]">₹{selectedSlot.price}</div>
                      <div className="text-xs text-[#5B6B7A]">+ platform fee</div>
                    </div>
                  </div>
                </div>

                <RazorpayPayment
                  bookingId={bookingId}
                  amount={selectedSlot.price + Math.round(selectedSlot.price * 0.03)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </CardContent>
            </Card>
            <aside className="grid gap-4">
              <Card>
                <CardContent className="p-4 text-sm text-[#5B6B7A]">
                  After payment, you'll receive:
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>Booking ID and full center details</li>
                    <li>.ics calendar invite</li>
                    <li>WhatsApp confirmation</li>
                    <li>Invoice (printable)</li>
                  </ul>
                </CardContent>
              </Card>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Slots
              </Button>
            </aside>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

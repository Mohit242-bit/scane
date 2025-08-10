"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "./loading-spinner"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  subject: z.enum(["general", "booking", "technical", "partnership", "feedback"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  variant?: "default" | "compact"
  className?: string
}

export default function ContactForm({ variant = "default", className = "" }: ContactFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData)

      // Submit to API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send message")
      }

      setSubmitted(true)
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        toast({
          title: "Failed to send message",
          description: error instanceof Error ? error.message : "Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (submitted && variant === "default") {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B7F171]/20">
              <CheckCircle className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-[#0B1B2B] mb-2">Message Sent Successfully!</h3>
          <p className="text-[#5B6B7A] mb-6">
            Thank you for contacting us. We've received your message and will respond within 24 hours.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="bg-transparent">
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-[#0B1B2B]">{variant === "compact" ? "Quick Contact" : "Get in Touch"}</CardTitle>
        <CardDescription className="text-[#5B6B7A]">
          {variant === "compact"
            ? "Send us a message and we'll respond quickly."
            : "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={variant === "compact" ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className={variant === "compact" ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-[#F5F7FA] text-[#5B6B7A]">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className={`rounded-l-none ${errors.phone ? "border-red-500" : ""}`}
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="booking">Booking Support</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tell us how we can help you..."
              rows={variant === "compact" ? 3 : 4}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
          </div>

          {submitted && variant === "compact" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Message sent successfully! We'll respond within 24 hours.</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-[#0AA1A7] hover:bg-[#089098]">
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-xs text-center text-[#5B6B7A]">
            We typically respond within 24 hours. For urgent matters, call{" "}
            <a href="tel:1800-SCANEZY" className="underline hover:text-[#0AA1A7]">
              1800-SCANEZY
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

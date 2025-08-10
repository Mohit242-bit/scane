"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Phone, Mail, MessageCircle, Search, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const faqs = [
  {
    question: "How do I reschedule my appointment?",
    answer:
      "You can reschedule your appointment up to 2 hours before the scheduled time. Use the reschedule link in your confirmation message or contact our support team.",
  },
  {
    question: "What should I bring to my appointment?",
    answer:
      "Please bring a valid ID, your prescription, and any previous reports. Arrive 15 minutes early for check-in.",
  },
  {
    question: "How long does it take to get my report?",
    answer:
      "Most reports are available within 24-48 hours. You'll receive a WhatsApp notification when your report is ready for download.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Full refunds are available for cancellations made 24+ hours in advance. Cancellations within 24 hours are subject to a processing fee.",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "We work with most major insurance providers. Please check with your insurance company for coverage details and bring your insurance card.",
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [ticketForm, setTicketForm] = useState({
    name: "",
    phone: "",
    bookingId: "",
    category: "",
    message: "",
  })
  const { toast } = useToast()

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock ticket submission
    toast({
      title: "Support ticket created",
      description:
        "We'll get back to you within 2 hours. Ticket ID: #" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    })
    setTicketForm({ name: "", phone: "", bookingId: "", category: "", message: "" })
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1B2B] mb-4">Support Center</h1>
        <p className="text-[#5B6B7A] text-lg">Get help with your bookings, payments, and general questions.</p>
      </div>

      {/* Quick Contact */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <Phone className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="font-semibold text-[#0B1B2B]">Call Us</div>
              <div className="text-sm text-[#5B6B7A]">1800-SCANEZY</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <MessageCircle className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="font-semibold text-[#0B1B2B]">WhatsApp</div>
              <div className="text-sm text-[#5B6B7A]">+91 98765 43210</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <Mail className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="font-semibold text-[#0B1B2B]">Email</div>
              <div className="text-sm text-[#5B6B7A]">help@scanezy.com</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* FAQ Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-[#5B6B7A]">Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#5B6B7A]" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-[#0B1B2B]">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-[#5B6B7A]">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Support Ticket Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Create Support Ticket</CardTitle>
              <CardDescription className="text-[#5B6B7A]">
                Can't find what you're looking for? We're here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={ticketForm.phone}
                      onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingId">Booking ID (if applicable)</Label>
                  <Input
                    id="bookingId"
                    value={ticketForm.bookingId}
                    onChange={(e) => setTicketForm({ ...ticketForm, bookingId: e.target.value })}
                    placeholder="e.g., BK123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking Issues</SelectItem>
                      <SelectItem value="payment">Payment & Refunds</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="report">Report Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0AA1A7] hover:bg-[#089098]">
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Response Time Info */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#0AA1A7]" />
                <span className="text-[#5B6B7A]">Average response time: 2 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <CheckCircle className="h-4 w-4 text-[#B7F171]" />
                <span className="text-[#5B6B7A]">24/7 support available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

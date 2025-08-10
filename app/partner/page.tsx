"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Upload, FileText, DollarSign, Star, CheckCircle } from "lucide-react"
import { db } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function PartnerPage() {
  const [todayBookings, setTodayBookings] = useState(
    db.bookings.filter((b) => {
      const today = new Date()
      const bookingDate = new Date(b.created_ts)
      return bookingDate.toDateString() === today.toDateString()
    }),
  )
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [reportFile, setReportFile] = useState<File | null>(null)
  const { toast } = useToast()

  const stats = {
    todayBookings: todayBookings.length,
    pendingReports: todayBookings.filter((b) => b.status === "CONFIRMED").length,
    monthlyEarnings: 45000, // Mock data
    avgRating: 4.6,
  }

  const handleConfirmBooking = (bookingId: string) => {
    const booking = db.bookings.find((b) => b.id === bookingId)
    if (booking) {
      booking.status = "CONFIRMED"
      setTodayBookings([...todayBookings])
      toast({
        title: "Booking confirmed",
        description: "Patient has been notified via WhatsApp.",
      })
    }
  }

  const handleUploadReport = async () => {
    if (!reportFile || !selectedBooking) return

    const formData = new FormData()
    formData.append("bookingId", selectedBooking)
    formData.append("type", "REPORT")
    formData.append("file", reportFile)

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast({
          title: "Report uploaded",
          description: "Patient will be notified when the report is ready.",
        })
        setReportFile(null)
        setSelectedBooking(null)
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1B2B] mb-4">Partner Center</h1>
        <p className="text-[#5B6B7A] text-lg">Manage your bookings, upload reports, and track performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <Calendar className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">{stats.todayBookings}</div>
              <div className="text-sm text-[#5B6B7A]">Today's Bookings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7F171]/20">
              <FileText className="h-5 w-5 text-[#0B1B2B]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">{stats.pendingReports}</div>
              <div className="text-sm text-[#5B6B7A]">Pending Reports</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <DollarSign className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">₹{stats.monthlyEarnings.toLocaleString()}</div>
              <div className="text-sm text-[#5B6B7A]">This Month</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7F171]/20">
              <Star className="h-5 w-5 text-[#0B1B2B]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">{stats.avgRating}</div>
              <div className="text-sm text-[#5B6B7A]">Avg Rating</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">Today's Bookings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Today's Schedule</CardTitle>
              <CardDescription className="text-[#5B6B7A]">
                Patient details are masked until 24 hours before appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#5B6B7A]" />
                          09:00 AM
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">***{booking.user_phone.slice(-4)}</div>
                          <div className="text-sm text-[#5B6B7A]">Details at T-24h</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                          className={booking.status === "CONFIRMED" ? "bg-[#B7F171] text-[#0B1B2B]" : ""}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmBooking(booking.id)}
                              className="bg-[#0AA1A7] hover:bg-[#089098]"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Confirm
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking.id)}>
                                <Upload className="mr-1 h-3 w-3" />
                                Upload Report
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Report</DialogTitle>
                                <DialogDescription>
                                  Upload the radiology report for booking {booking.id.slice(0, 8)}...
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="report-file">Report File</Label>
                                  <Input
                                    id="report-file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                                  />
                                  <div className="text-xs text-[#5B6B7A]">
                                    Accepted formats: PDF, JPG, PNG (max 10MB)
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={handleUploadReport}
                                disabled={!reportFile}
                                className="bg-[#0AA1A7] hover:bg-[#089098]"
                              >
                                Upload Report
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Report Management</CardTitle>
              <CardDescription className="text-[#5B6B7A]">Upload and manage patient reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[#5B6B7A]">
                Report management features:
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Upload reports in PDF or image format</li>
                  <li>Automatic patient notification when ready</li>
                  <li>Digital signature and watermarking</li>
                  <li>Secure cloud storage with access logs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Manage Availability</CardTitle>
              <CardDescription className="text-[#5B6B7A]">Set your working hours and slot availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[#5B6B7A]">
                Availability management features:
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Set daily working hours and breaks</li>
                  <li>Block specific dates for holidays</li>
                  <li>Adjust slot duration per service type</li>
                  <li>Emergency slot allocation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Earnings & Settlements</CardTitle>
              <CardDescription className="text-[#5B6B7A]">Track your revenue and payment settlements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-[#5B6B7A]">This Month</div>
                  <div className="text-2xl font-bold text-[#0B1B2B]">₹45,000</div>
                  <div className="text-sm text-[#B7F171]">+12% from last month</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-[#5B6B7A]">Pending Settlement</div>
                  <div className="text-2xl font-bold text-[#0B1B2B]">₹12,500</div>
                  <div className="text-sm text-[#5B6B7A]">Next payout: Dec 15</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

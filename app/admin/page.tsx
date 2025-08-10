"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { BarChart, Users, Calendar, DollarSign, Download, Plus, Edit, Trash2 } from "lucide-react"
import { db } from "@/lib/db"
import { servicesSeed } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [bookings, setBookings] = useState(db.bookings)
  const [loading, setLoading] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    modality: "MRI",
    duration_min: 30,
    base_price: 1000,
    prep_text_md: "",
  })
  const { toast } = useToast()

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.status === "CONFIRMED" ? b.amount : 0), 0),
    avgBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length : 0,
  }

  const handleAddService = () => {
    // Mock service addition
    toast({
      title: "Service added",
      description: `${newService.name} has been added to the catalog.`,
    })
    setNewService({
      name: "",
      modality: "MRI",
      duration_min: 30,
      base_price: 1000,
      prep_text_md: "",
    })
  }

  const handleExportBookings = () => {
    const csv = [
      "Booking ID,User Phone,Service,Status,Amount,Created",
      ...bookings.map(
        (b) =>
          `${b.id},${b.user_phone},${b.service_id},${b.status},${b.amount},${new Date(b.created_ts).toISOString()}`,
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export complete",
      description: "Bookings data has been downloaded as CSV.",
    })
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1B2B] mb-4">Admin Dashboard</h1>
        <p className="text-[#5B6B7A] text-lg">Manage services, bookings, and platform settings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <Calendar className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">{stats.totalBookings}</div>
              <div className="text-sm text-[#5B6B7A]">Total Bookings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7F171]/20">
              <Users className="h-5 w-5 text-[#0B1B2B]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">{stats.confirmedBookings}</div>
              <div className="text-sm text-[#5B6B7A]">Confirmed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
              <DollarSign className="h-5 w-5 text-[#0AA1A7]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-[#5B6B7A]">Revenue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7F171]/20">
              <BarChart className="h-5 w-5 text-[#0B1B2B]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0B1B2B]">₹{Math.round(stats.avgBookingValue)}</div>
              <div className="text-sm text-[#5B6B7A]">Avg Booking</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0B1B2B]">Recent Bookings</CardTitle>
                  <CardDescription className="text-[#5B6B7A]">Latest booking activity</CardDescription>
                </div>
                <Button onClick={handleExportBookings} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 10).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">{booking.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.user_name || "N/A"}</div>
                          <div className="text-sm text-[#5B6B7A]">{booking.user_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                          className={booking.status === "CONFIRMED" ? "bg-[#B7F171] text-[#0B1B2B]" : ""}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{booking.amount}</TableCell>
                      <TableCell>{new Date(booking.created_ts).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0B1B2B]">Service Catalog</CardTitle>
                  <CardDescription className="text-[#5B6B7A]">Manage available services</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#0AA1A7] hover:bg-[#089098]">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>Create a new radiology service offering.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="service-name">Service Name</Label>
                        <Input
                          id="service-name"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          placeholder="e.g., MRI Brain with Contrast"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="modality">Modality</Label>
                        <Select
                          value={newService.modality}
                          onValueChange={(value) => setNewService({ ...newService, modality: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MRI">MRI</SelectItem>
                            <SelectItem value="CT">CT</SelectItem>
                            <SelectItem value="XRAY">X-Ray</SelectItem>
                            <SelectItem value="USG">Ultrasound</SelectItem>
                            <SelectItem value="PET">PET Scan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newService.duration_min}
                          onChange={(e) =>
                            setNewService({ ...newService, duration_min: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Base Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newService.base_price}
                          onChange={(e) =>
                            setNewService({ ...newService, base_price: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prep">Preparation Instructions</Label>
                        <Textarea
                          id="prep"
                          value={newService.prep_text_md}
                          onChange={(e) => setNewService({ ...newService, prep_text_md: e.target.value })}
                          placeholder="Enter preparation instructions..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddService} className="bg-[#0AA1A7] hover:bg-[#089098]">
                      Add Service
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Modality</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesSeed().map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.modality}</Badge>
                      </TableCell>
                      <TableCell>{service.duration_min} min</TableCell>
                      <TableCell>₹{service.base_price}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#B7F171] text-[#0B1B2B]">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0B1B2B]">Partner Centers</CardTitle>
              <CardDescription className="text-[#5B6B7A]">Manage radiology center partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[#5B6B7A]">
                Center management features would include:
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Add/edit center details and certifications</li>
                  <li>Manage slot availability and pricing</li>
                  <li>Monitor center performance metrics</li>
                  <li>Handle settlement and commission tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Platform Settings</CardTitle>
                <CardDescription className="text-[#5B6B7A]">Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#0B1B2B]">Slot Hold Duration</div>
                    <div className="text-sm text-[#5B6B7A]">How long to hold slots during payment</div>
                  </div>
                  <Select defaultValue="7">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="7">7 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#0B1B2B]">Platform Fee</div>
                    <div className="text-sm text-[#5B6B7A]">Commission percentage</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#0B1B2B]">3%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Integration Status</CardTitle>
                <CardDescription className="text-[#5B6B7A]">Third-party service connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Razorpay Payments</span>
                  <Badge variant="outline" className="text-[#FF735C] border-[#FF735C]">
                    Not Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp API</span>
                  <Badge variant="outline" className="text-[#FF735C] border-[#FF735C]">
                    Not Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge variant="outline" className="text-[#FF735C] border-[#FF735C]">
                    Not Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <Badge className="bg-[#B7F171] text-[#0B1B2B]">Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

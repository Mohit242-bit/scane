"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import AdminGuard from "@/components/admin-guard"
import AdminNavigation from "@/components/admin-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  CalendarDays, 
  Users, 
  Building2, 
  Stethoscope, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"

interface Booking {
  id: number
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  status: string
  payment_status: string
  total_amount: number
  services: { name: string; modality: string }
  centers: { name: string; city: string }
  users: { full_name: string; email: string }
}

interface Service {
  id: number
  name: string
  description: string
  modality: string
  price: number
  is_active: boolean
  partners: { business_name: string }
}

interface Center {
  id: number
  name: string
  city: string
  area_hint: string
  rating: number
  is_active: boolean
  partners: { business_name: string }
}

interface Partner {
  id: number
  business_name: string
  business_email: string
  city: string
  status: string
  users: { full_name: string; email: string }
}

interface User {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  auth_provider: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const router = useRouter()
  const { toast } = useToast()

  // Get session from Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        setStatus('unauthenticated')
      } else {
        setSession(session)
        setStatus(session ? 'authenticated' : 'unauthenticated')
      }
    }
    getSession()
  }, [])

  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [users, setUsers] = useState<User[]>([])
  // SQL editor states
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM bookings LIMIT 10")
  const [sqlResults, setSqlResults] = useState<any[]>([])
  const [sqlError, setSqlError] = useState<string | null>(null)
  const [sqlLoading, setSqlLoading] = useState<boolean>(false)
  const [sqlColumns, setSqlColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [weekFilter, setWeekFilter] = useState<'this_week' | 'last_week' | 'all'>('this_week')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch admin stats
      const statsRes = await fetch("/api/admin/stats")
      const statsData = await statsRes.json()
      
      // Fetch table data using admin API
      const [bookingsRes, servicesRes, centersRes, partnersRes, usersRes] = await Promise.all([
        fetch("/api/admin/tables?table=bookings&limit=50"),
        fetch("/api/admin/tables?table=services&limit=50"),
        fetch("/api/admin/tables?table=centers&limit=50"),
        fetch("/api/admin/tables?table=partners&limit=50"),
        fetch("/api/admin/users?limit=50")
      ])

      const [bookingsData, servicesData, centersData, partnersData, usersData] = await Promise.all([
        bookingsRes.json(),
        servicesRes.json(),
        centersRes.json(),
        partnersRes.json(),
        usersRes.json()
      ])

      setBookings(bookingsData)
      setServices(servicesData)
      setCenters(centersData)
      setPartners(partnersData)
      setUsers(usersData)
      
      // You can also set stats here if needed
      console.log("Admin stats:", statsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Execute a safe SQL query via server API
  const runSql = async () => {
    setSqlError(null)
    setSqlResults([])
    setSqlColumns([])
    setSqlLoading(true)
    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery })
      })

      const json = await res.json()

      if (!res.ok) {
        setSqlError(json?.error || 'Query failed')
        return
      }

      const data = json?.data || []
      setSqlResults(data)
      setSqlColumns(data.length ? Object.keys(data[0]) : [])
    } catch (err) {
      setSqlError('Network error')
    } finally {
      setSqlLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "bookings", id: bookingId, status })
      })

      if (!response.ok) throw new Error("Failed to update booking")

      toast({
        title: "Success",
        description: "Booking status updated"
      })

      fetchData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      })
    }
  }

  const updatePartnerStatus = async (partnerId: number, status: string) => {
    try {
      const response = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "partners", id: partnerId, status })
      })

      if (!response.ok) throw new Error("Failed to update partner")

      toast({
        title: "Success",
        description: "Partner status updated"
      })

      fetchData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string, type: "booking" | "partner" | "payment") => {
    const variants = {
      booking: {
        pending: "outline",
        confirmed: "default",
        completed: "secondary",
        cancelled: "destructive",
        no_show: "destructive"
      },
      partner: {
        pending: "outline",
        approved: "default",
        rejected: "destructive",
        suspended: "destructive"
      },
      payment: {
        pending: "outline",
        paid: "default",
        failed: "destructive",
        refunded: "secondary"
      }
    } as const

    return (
      <Badge variant={variants[type][status as keyof typeof variants[typeof type]] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.services?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    // Week filter
    const appointmentDate = new Date(booking.appointment_date)

    const getWeekRange = (weeksAgo: number) => {
      const now = new Date()
      // Use Monday as start of week
      const day = now.getDay() || 7 // Sunday -> 7
      const monday = new Date(now)
      monday.setHours(0,0,0,0)
      monday.setDate(now.getDate() - (day - 1) - (weeksAgo * 7))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23,59,59,999)
      return { start: monday, end: sunday }
    }

    let matchesWeek = true
    if (weekFilter === 'this_week') {
      const { start, end } = getWeekRange(0)
      matchesWeek = appointmentDate >= start && appointmentDate <= end
    } else if (weekFilter === 'last_week') {
      const { start, end } = getWeekRange(1)
      matchesWeek = appointmentDate >= start && appointmentDate <= end
    }

    return matchesSearch && matchesStatus && matchesWeek
  })

  // Sort latest first by appointment_date
  filteredBookings.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AA1A7] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Admin Dashboard</h1>
        <p className="text-[#5B6B7A]">Manage bookings, services, centers, and partners</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Total Bookings</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{bookings.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Active Services</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">
                  {services.filter(s => s.is_active).length}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Active Centers</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">
                  {centers.filter(c => c.is_active).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Partners</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{partners.length}</p>
              </div>
              <Users className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="sql">SQL Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>View and manage all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bookings Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.patient_name}</div>
                            <div className="text-sm text-gray-500">{booking.patient_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.services?.name}</div>
                            <div className="text-sm text-gray-500">{booking.services?.modality}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.centers?.name}</div>
                            <div className="text-sm text-gray-500">{booking.centers?.city}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.appointment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status, "booking")}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.payment_status, "payment")}
                        </TableCell>
                        <TableCell>₹{booking.total_amount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Booking Details</DialogTitle>
                                </DialogHeader>
                                {selectedBooking && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Patient Information</Label>
                                      <div className="mt-1 text-sm">
                                        <p>{selectedBooking.patient_name}</p>
                                        <p>{selectedBooking.patient_email}</p>
                                        <p>{selectedBooking.patient_phone}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Service & Location</Label>
                                      <div className="mt-1 text-sm">
                                        <p>{selectedBooking.services?.name}</p>
                                        <p>{selectedBooking.centers?.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Confirm
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
          <TabsContent value="sql" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SQL Editor</CardTitle>
                <CardDescription>Run read-only SQL queries (admin only). Only SELECTs allowed by default.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="font-mono text-sm h-40"
                  />
                  <div className="flex gap-2">
                    <Button onClick={runSql} disabled={sqlLoading}>
                      {sqlLoading ? 'Running...' : 'Run'}
                    </Button>
                    <Button variant="ghost" onClick={() => { setSqlQuery('SELECT * FROM bookings LIMIT 10'); setSqlResults([]); setSqlError(null); }}>
                      Reset
                    </Button>
                  </div>

                  {sqlError && (
                    <div className="text-red-600">{sqlError}</div>
                  )}

                  <div className="rounded-md border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {sqlColumns.map((col) => (
                            <TableHead key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sqlResults.map((row, i) => (
                          <TableRow key={i}>
                            {sqlColumns.map((col) => (
                              <TableCell key={col}>{String(row[col] ?? '')}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Auth Provider</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.full_name || "N/A"}</div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === "admin" ? "default" :
                            user.role === "partner" ? "secondary" :
                            "outline"
                          }>
                            {user.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.auth_provider}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>View and manage all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Modality</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{service.modality}</TableCell>
                        <TableCell>{service.partners?.business_name}</TableCell>
                        <TableCell>₹{service.price}</TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? "default" : "outline"}>
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Center Management</CardTitle>
              <CardDescription>View and manage all diagnostic centers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Center Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell>
                          <div className="font-medium">{center.name}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{center.area_hint}</div>
                            <div className="text-sm text-gray-500">{center.city}</div>
                          </div>
                        </TableCell>
                        <TableCell>{center.partners?.business_name}</TableCell>
                        <TableCell>{center.rating.toFixed(1)} ⭐</TableCell>
                        <TableCell>
                          <Badge variant={center.is_active ? "default" : "outline"}>
                            {center.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Management</CardTitle>
              <CardDescription>View and manage partner applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="font-medium">{partner.business_name}</div>
                        </TableCell>
                        <TableCell>{partner.users?.full_name}</TableCell>
                        <TableCell>{partner.business_email}</TableCell>
                        <TableCell>{partner.city}</TableCell>
                        <TableCell>
                          {getStatusBadge(partner.status, "partner")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {partner.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updatePartnerStatus(partner.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updatePartnerStatus(partner.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminGuard>
  )
}

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
  business_phone: string
  address: string
  city: string
  cities?: string
  status: string
  created_at: string
  updated_at: string
  users: { full_name: string; email: string; phone: string; created_at: string }
  stats?: {
    totalCenters: number
    activeCenters: number
    totalServices: number
    activeServices: number
    totalBookings: number
    completedBookings: number
    totalRevenue: number
    avgRating: number
  }
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
  const router = useRouter()
  const { toast } = useToast()

  // Get session from Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else if (!session) {
        // No authenticated session
        console.log('No session found')
      }
    }
    getSession()
  }, [])

  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [partnerStats, setPartnerStats] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
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
        fetch("/api/admin/partners"),
        fetch("/api/admin/users?limit=50")
      ])

      const [bookingsData, servicesData, centersData, partnersResponse, usersData] = await Promise.all([
        bookingsRes.json(),
        servicesRes.json(),
        centersRes.json(),
        partnersRes.json(),
        usersRes.json()
      ])

      setBookings(bookingsData)
      setServices(servicesData)
      setCenters(centersData)
      setPartners(partnersResponse.partners || [])
      setPartnerStats(partnersResponse.stats || null)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Total Bookings</p>
                <p className="text-xl font-bold text-[#0B1B2B]">{bookings.length}</p>
              </div>
              <CalendarDays className="h-6 w-6 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Active Services</p>
                <p className="text-xl font-bold text-[#0B1B2B]">
                  {services.filter(s => s.is_active).length}
                </p>
              </div>
              <Stethoscope className="h-6 w-6 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Active Centers</p>
                <p className="text-xl font-bold text-[#0B1B2B]">
                  {centers.filter(c => c.is_active).length}
                </p>
              </div>
              <Building2 className="h-6 w-6 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Total Partners</p>
                <p className="text-xl font-bold text-[#0B1B2B]">{partnerStats?.totalPartners || 0}</p>
              </div>
              <Users className="h-6 w-6 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Active Partners</p>
                <p className="text-xl font-bold text-green-600">{partnerStats?.activePartners || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#5B6B7A]">Pending Partners</p>
                <p className="text-xl font-bold text-orange-600">{partnerStats?.pendingPartners || 0}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Analytics Cards */}
      {partnerStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-[#5B6B7A]">Total Revenue</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">
                  ₹{partnerStats.totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-[#5B6B7A]">Cities Coverage</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{partnerStats.citiesCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-[#5B6B7A]">Avg Rating</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">
                  {partnerStats.avgRating.toFixed(1)} ⭐
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-[#5B6B7A]">Total Services</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{partnerStats.totalServices}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sql">SQL Query</TabsTrigger>
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

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive insights and performance metrics for all partners</CardDescription>
            </CardHeader>
            <CardContent>
              {partnerStats ? (
                <div className="space-y-6">
                  {/* Revenue Analytics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Revenue Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-800">
                              ₹{partnerStats.totalRevenue.toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-green-600">Across all partners</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700">Avg Revenue/Partner</p>
                            <p className="text-2xl font-bold text-blue-800">
                              ₹{partnerStats.totalPartners > 0 ? 
                                Math.round(partnerStats.totalRevenue / partnerStats.totalPartners).toLocaleString('en-IN') : '0'
                              }
                            </p>
                            <p className="text-sm text-blue-600">Per active partner</p>
                          </div>
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700">Platform Rating</p>
                            <p className="text-2xl font-bold text-purple-800">
                              {partnerStats.avgRating.toFixed(1)} ⭐
                            </p>
                            <p className="text-sm text-purple-600">Overall average</p>
                          </div>
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Partners */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Performing Partners</h3>
                    <div className="bg-white rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Partner</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Centers</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Rating</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partners
                            .filter(p => p.stats && p.stats.totalRevenue > 0)
                            .sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0))
                            .slice(0, 10)
                            .map((partner, index) => (
                              <TableRow key={partner.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      index === 0 ? 'bg-yellow-200 text-yellow-800' :
                                      index === 1 ? 'bg-gray-200 text-gray-800' :
                                      index === 2 ? 'bg-orange-200 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      #{index + 1}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{partner.business_name}</div>
                                    <div className="text-sm text-gray-500">{partner.city}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-green-600">
                                    ₹{partner.stats?.totalRevenue.toLocaleString('en-IN')}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <div className="font-medium">{partner.stats?.totalCenters}</div>
                                    <div className="text-xs text-gray-500">
                                      {partner.stats?.activeCenters} active
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <div className="font-medium">{partner.stats?.totalBookings}</div>
                                    <div className="text-xs text-gray-500">
                                      {partner.stats?.completedBookings} completed
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {partner.stats?.avgRating > 0 ? 
                                      `${partner.stats.avgRating} ⭐` : 'N/A'
                                    }
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Geographic Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Cities with Most Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {partnerStats.topCities.slice(0, 8).map(({ city, count }) => (
                              <div key={city} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="font-medium">{city}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-blue-600">{count}</div>
                                  <div className="text-xs text-gray-500">
                                    {((count / partnerStats.totalPartners) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Partner Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span>Active Partners</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">{partnerStats.activePartners}</div>
                                <div className="text-xs text-gray-500">
                                  {((partnerStats.activePartners / partnerStats.totalPartners) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <span>Pending Approval</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-600">{partnerStats.pendingPartners}</div>
                                <div className="text-xs text-gray-500">
                                  {((partnerStats.pendingPartners / partnerStats.totalPartners) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            
                            {partnerStats.suspendedPartners > 0 && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  <span>Suspended</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-red-600">{partnerStats.suspendedPartners}</div>
                                  <div className="text-xs text-gray-500">
                                    {((partnerStats.suspendedPartners / partnerStats.totalPartners) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {partnerStats.rejectedPartners > 0 && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <XCircle className="h-5 w-5 text-gray-600" />
                                  <span>Rejected</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-600">{partnerStats.rejectedPartners}</div>
                                  <div className="text-xs text-gray-500">
                                    {((partnerStats.rejectedPartners / partnerStats.totalPartners) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-800">
                            {partnerStats.totalCenters}
                          </div>
                          <div className="text-sm text-yellow-700">Total Centers</div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Avg {(partnerStats.totalCenters / partnerStats.totalPartners).toFixed(1)} per partner
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-800">
                            {partnerStats.totalServices}
                          </div>
                          <div className="text-sm text-indigo-700">Total Services</div>
                          <div className="text-xs text-indigo-600 mt-1">
                            Avg {(partnerStats.totalServices / partnerStats.totalPartners).toFixed(1)} per partner
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-800">
                            {partnerStats.citiesCount}
                          </div>
                          <div className="text-sm text-pink-700">Cities Covered</div>
                          <div className="text-xs text-pink-600 mt-1">
                            Geographic reach
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-teal-800">
                            {Math.round((partnerStats.activePartners / partnerStats.totalPartners) * 100)}%
                          </div>
                          <div className="text-sm text-teal-700">Approval Rate</div>
                          <div className="text-xs text-teal-600 mt-1">
                            Partner success rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Loading Analytics</h3>
                  <p className="text-gray-600">Please wait while we gather partner data...</p>
                </div>
              )}
            </CardContent>
          </Card>
    </TabsContent>
    {/* Close previous TabsContent before starting new one */}

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
      {/* Close previous TabsContent before starting new one */}

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
    {/* Close previous TabsContent before starting new one */}

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
    {/* Close previous TabsContent before starting new one */}

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
    {/* Close previous TabsContent before starting new one */}

    <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Partner Management</CardTitle>
                  <CardDescription>View and manage partner applications with detailed analytics</CardDescription>
                </div>
                <div className="text-sm text-[#5B6B7A]">
                  {partnerStats && (
                    <div className="text-right">
                      <div>Total: {partnerStats.totalPartners}</div>
                      <div>Pending: {partnerStats.pendingPartners}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Details</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.business_name}</div>
                            <div className="text-sm text-gray-500">{partner.business_email}</div>
                            {partner.business_phone && (
                              <div className="text-sm text-gray-500">{partner.business_phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.users?.full_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{partner.users?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.city || 'N/A'}</div>
                            {partner.cities && partner.cities !== partner.city && (
                              <div className="text-sm text-gray-500">Also: {partner.cities}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {partner.stats ? (
                              <div>
                                <div>{partner.stats.totalCenters} centers</div>
                                <div>{partner.stats.totalServices} services</div>
                                <div className="text-green-600">
                                  ₹{partner.stats.totalRevenue.toLocaleString('en-IN')}
                                </div>
                                {partner.stats.avgRating > 0 && (
                                  <div>{partner.stats.avgRating} ⭐</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500">No activity</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(partner.created_at).toLocaleDateString()}</div>
                            <div className="text-gray-500">
                              {Math.ceil(
                                (Date.now() - new Date(partner.created_at).getTime()) / 
                                (1000 * 60 * 60 * 24)
                              )} days ago
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(partner.status, "partner")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPartner(partner)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {partner.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updatePartnerStatus(partner.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updatePartnerStatus(partner.id, "rejected")}
                                  className="h-8 px-2"
                                >
                                  <XCircle className="h-4 w-4" />
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

          {/* Top Cities Analytics */}
          {partnerStats?.topCities && partnerStats.topCities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Partner Distribution by City</CardTitle>
                <CardDescription>Top cities with partner presence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {partnerStats.topCities.map(({ city, count }, index) => (
                    <div key={city} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-[#0B1B2B]">{count}</div>
                      <div className="text-sm text-[#5B6B7A]">{city}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedPartner.business_name}
              </DialogTitle>
              <DialogDescription>
                Partner details and performance metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Business Name</label>
                      <div className="font-medium">{selectedPartner.business_name}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Email</label>
                      <div>{selectedPartner.business_email}</div>
                    </div>
                    {selectedPartner.business_phone && (
                      <div>
                        <label className="text-xs text-gray-600">Phone</label>
                        <div>{selectedPartner.business_phone}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-600">City</label>
                      <div>{selectedPartner.city}</div>
                    </div>
                    {selectedPartner.address && (
                      <div>
                        <label className="text-xs text-gray-600">Address</label>
                        <div className="text-sm">{selectedPartner.address}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-600">Status</label>
                      <div>{getStatusBadge(selectedPartner.status, "partner")}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact Person</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Name</label>
                      <div className="font-medium">{selectedPartner.users?.full_name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Email</label>
                      <div>{selectedPartner.users?.email}</div>
                    </div>
                    {selectedPartner.users?.phone && (
                      <div>
                        <label className="text-xs text-gray-600">Phone</label>
                        <div>{selectedPartner.users.phone}</div>
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-600">Member Since</label>
                      <div>{new Date(selectedPartner.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Account Age</label>
                      <div>
                        {Math.ceil((Date.now() - new Date(selectedPartner.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              {selectedPartner.stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedPartner.stats.totalCenters}
                        </div>
                        <div className="text-xs text-gray-600">Centers</div>
                        <div className="text-xs text-green-600">
                          {selectedPartner.stats.activeCenters} active
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPartner.stats.totalServices}
                        </div>
                        <div className="text-xs text-gray-600">Services</div>
                        <div className="text-xs text-green-600">
                          {selectedPartner.stats.activeServices} active
                        </div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedPartner.stats.totalBookings}
                        </div>
                        <div className="text-xs text-gray-600">Bookings</div>
                        <div className="text-xs text-green-600">
                          {selectedPartner.stats.completedBookings} completed
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{selectedPartner.stats.totalRevenue.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-600">Revenue</div>
                        {selectedPartner.stats.avgRating > 0 && (
                          <div className="text-xs text-yellow-600">
                            {selectedPartner.stats.avgRating} ⭐ rating
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedPartner.status === "pending" && (
                  <>
                    <Button 
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, "approved")
                        setSelectedPartner(null)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Partner
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, "rejected")
                        setSelectedPartner(null)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Partner
                    </Button>
                  </>
                )}
                {selectedPartner.status === "approved" && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updatePartnerStatus(selectedPartner.id, "suspended")
                      setSelectedPartner(null)
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Suspend Partner
                  </Button>
                )}
                {selectedPartner.status === "suspended" && (
                  <Button 
                    onClick={() => {
                      updatePartnerStatus(selectedPartner.id, "approved")
                      setSelectedPartner(null)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Reactivate Partner
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </AdminGuard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminGuard from "@/components/admin-guard"
import AdminNavigation from "@/components/admin-navigation"
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CalendarDays, 
  Search, 
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye
} from "lucide-react"
import Link from "next/link"

interface RegisteredUser {
  name: string
  email: string
  phone: string
  bookingsCount: number
  lastBooking: string
}

interface CenterStats {
  totalBookings: number
  registeredUsers: RegisteredUser[]
  registeredUsersCount: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  recentBookings: Array<{
    id: number
    patient_name: string
    appointment_date: string
    status: string
    services: {
      name: string
      category: string
    }
  }>
}

interface Center {
  id: number
  name: string
  address: string
  city: string
  area_hint: string
  phone: string
  email: string
  operating_hours: any
  is_active: boolean
  stats: CenterStats
  partners?: {
    name: string
    email: string
  }
}

interface AdminCentersData {
  centers: Center[]
  totalCenters: number
  activeCenters: number
  totalRegistrations: number
  totalBookings: number
}

export default function AdminCentersPage() {
  const [data, setData] = useState<AdminCentersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null)

  useEffect(() => {
    async function fetchCentersData() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/centers')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch centers data')
        }
        
        setData(result)
      } catch (err) {
        console.error('Error fetching centers data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load centers data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCentersData()
  }, [])

  const filteredCenters = data?.centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.area_hint.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <AdminGuard>
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0AA1A7]" />
            <span className="ml-2 text-gray-600">Loading centers data...</span>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (error) {
    return (
      <AdminGuard>
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Centers</h3>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
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
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Centers Management</h1>
          <p className="text-[#5B6B7A]">Detailed analytics and management for all diagnostic centers</p>
        </div>

        {/* Summary Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Total Centers</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{data.totalCenters}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Active Centers</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{data.activeCenters}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Total Users</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{data.totalRegistrations}</p>
                  </div>
                  <Users className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Total Bookings</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{data.totalBookings}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search centers by name, city, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {filteredCenters.length} center{filteredCenters.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Centers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Centers</CardTitle>
            <CardDescription>Comprehensive list of all diagnostic centers with detailed statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Center</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{center.name}</div>
                          <div className="text-sm text-gray-500">{center.partners?.name || 'No partner'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{center.city}</div>
                          <div className="text-gray-500">{center.area_hint}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={center.is_active ? "default" : "secondary"}>
                          {center.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          {center.stats.registeredUsersCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 text-[#0AA1A7] mr-1" />
                            {center.stats.totalBookings}
                          </div>
                          <div className="text-xs text-green-600">
                            {center.stats.completedBookings} completed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {center.stats.pendingBookings > 0 ? (
                          <Badge variant="outline" className="text-orange-600">
                            {center.stats.pendingBookings}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCenter(center)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Center Details Modal-like Section */}
        {selectedCenter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B1B2B]">{selectedCenter.name}</h2>
                    <p className="text-[#5B6B7A]">Center Details & Analytics</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCenter(null)}>
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Registered Users</TabsTrigger>
                    <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Center Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedCenter.address}, {selectedCenter.city}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{selectedCenter.phone}</span>
                          </div>
                          {selectedCenter.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm">{selectedCenter.email}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {typeof selectedCenter.operating_hours === 'string' 
                                ? selectedCenter.operating_hours 
                                : '9:00 AM - 6:00 PM'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[#0AA1A7]">
                                {selectedCenter.stats.totalBookings}
                              </div>
                              <div className="text-sm text-gray-500">Total Bookings</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-500">
                                {selectedCenter.stats.registeredUsersCount}
                              </div>
                              <div className="text-sm text-gray-500">Registered Users</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-500">
                                {selectedCenter.stats.completedBookings}
                              </div>
                              <div className="text-sm text-gray-500">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-500">
                                {selectedCenter.stats.pendingBookings}
                              </div>
                              <div className="text-sm text-gray-500">Pending</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="users">
                    <Card>
                      <CardHeader>
                        <CardTitle>Registered Users ({selectedCenter.stats.registeredUsersCount})</CardTitle>
                        <CardDescription>Users who have booked appointments at this center</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedCenter.stats.registeredUsers.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Phone</TableHead>
                                  <TableHead>Bookings</TableHead>
                                  <TableHead>Last Booking</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedCenter.stats.registeredUsers.map((user, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{user.bookingsCount}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(user.lastBooking).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No registered users found</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bookings">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest booking activity at this center</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedCenter.stats.recentBookings.length > 0 ? (
                          <div className="space-y-4">
                            {selectedCenter.stats.recentBookings.map((booking, index) => (
                              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <div className="font-medium">{booking.patient_name}</div>
                                  <div className="text-sm text-gray-500">
                                    {booking.services?.name} ({booking.services?.category})
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(booking.appointment_date).toLocaleDateString()}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    booking.status === "completed" ? "default" :
                                    booking.status === "pending" ? "outline" :
                                    "destructive"
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No recent bookings found</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
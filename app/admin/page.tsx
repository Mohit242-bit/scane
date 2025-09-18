"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminGuard from "@/components/admin-guard"
import AdminNavigation from "@/components/admin-navigation"
import { 
  CalendarDays, 
  Users, 
  Building2, 
  Stethoscope, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Settings,
  UserCheck,
  AlertTriangle,
  Loader2
} from "lucide-react"

interface AdminStats {
  totalCenters: number
  activeCenters: number
  totalRegistrations: number
  totalBookings: number
  centers: Array<{
    id: number
    name: string
    city: string
    is_active: boolean
    stats: {
      totalBookings: number
      registeredUsersCount: number
      pendingBookings: number
      completedBookings: number
      recentBookings: Array<{
        patient_name: string
        appointment_date: string
        status: string
      }>
    }
  }>
}


export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/centers')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch admin data')
        }
        
        setStats(data)
      } catch (err) {
        console.error('Error fetching admin data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdminData()
  }, [])

  // Generate recent activity from actual data
  const recentActivity = stats ? stats.centers.flatMap(center => 
    center.stats.recentBookings.map(booking => ({
      id: `${center.id}-${booking.patient_name}`,
      type: "booking" as const,
      description: `New booking by ${booking.patient_name} at ${center.name}`,
      time: new Date(booking.appointment_date).toLocaleDateString(),
      status: booking.status,
      centerName: center.name
    }))
  ).slice(0, 4) : []
  return (
    <AdminGuard>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Admin Panel</h1>
          <p className="text-[#5B6B7A]">Welcome to Scanezy administration dashboard</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0AA1A7]" />
            <span className="ml-2 text-gray-600">Loading admin data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Total Bookings</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{stats.totalBookings}</p>
                    <p className="text-xs text-blue-600">Across all centers</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Total Centers</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{stats.totalCenters}</p>
                    <p className="text-xs text-green-600">{stats.activeCenters} active</p>
                  </div>
                  <Building2 className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Registered Users</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">{stats.totalRegistrations}</p>
                    <p className="text-xs text-blue-600">Total registrations</p>
                  </div>
                  <Users className="h-8 w-8 text-[#0AA1A7]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5B6B7A]">Pending Bookings</p>
                    <p className="text-2xl font-bold text-[#0B1B2B]">
                      {stats.centers.reduce((sum, c) => sum + c.stats.pendingBookings, 0)}
                    </p>
                    <p className="text-xs text-orange-600">Require attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/centers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">View All Centers</h3>
                  <p className="text-sm text-[#5B6B7A]">Browse all diagnostic centers</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/centers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Centers Management</h3>
                  <p className="text-sm text-[#5B6B7A]">Detailed center analytics and management</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-50">
              <CardContent className="p-6 text-center">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-gray-500">Booking Management</h3>
                <p className="text-sm text-gray-400">Coming soon...</p>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="p-6 text-center">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-gray-500">Partner Management</h3>
                <p className="text-sm text-gray-400">Coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest bookings across all centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-[#0AA1A7]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-[#5B6B7A]">{activity.time}</p>
                      </div>
                      <Badge 
                        variant={
                          activity.status === "completed" ? "default" :
                          activity.status === "pending" ? "outline" :
                          "destructive"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent bookings found</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/centers">
                    <Button variant="outline" className="w-full">
                      View All Centers
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Centers Overview</CardTitle>
                <CardDescription>Statistics across all centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Active Centers</span>
                    </div>
                    <Badge variant="default">{stats.activeCenters}/{stats.totalCenters}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Total Bookings</span>
                    </div>
                    <Badge variant="outline">{stats.totalBookings}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Registered Users</span>
                    </div>
                    <Badge variant="outline">{stats.totalRegistrations}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Pending Bookings</span>
                    </div>
                    <Badge variant="secondary">
                      {stats.centers.reduce((sum, c) => sum + c.stats.pendingBookings, 0)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-[#5B6B7A] mb-2">System Health</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: "95%"}}></div>
                    </div>
                    <div className="text-xs text-[#5B6B7A] mt-1">95% - Excellent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
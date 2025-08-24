"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp,
  LogOut,
  Settings,
  Eye,
  Edit,
  Plus
} from "lucide-react"
import supabase from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

interface PartnerProfile {
  id: string
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  city: string
  status: string
}

interface Center {
  id: number
  name: string
  address: string
  city: string
  area_hint: string
  phone: string
  rating: number
  is_active: boolean
  operating_hours: any
  amenities: string[]
}

interface Booking {
  id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  status: string
  total_amount: number
  service_name?: string
  center_name?: string
}

export default function PartnerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<User | null>(null)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [centers, setCenters] = useState<Center[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalBookings: 0,
    todayBookings: 0,
    monthlyEarnings: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      // Check if user is authenticated
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push("/partner/login")
        return
      }

      setUser(authUser as User)
      await fetchPartnerData()
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/partner/login")
    }
  }

  const fetchPartnerData = async () => {
    try {
      setLoading(true)

      // Get partner profile using API
      const profileResponse = await fetch('/api/partner/profile', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
          // Partner not onboarded yet, redirect to onboarding
          router.push("/partner/onboarding")
          return
        }
        throw new Error('Failed to load partner profile')
      }

      const partnerData = await profileResponse.json()
      setPartner(partnerData)

      // Get centers using API
      const centersResponse = await fetch('/api/partner/centers', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (centersResponse.ok) {
        const centersData = await centersResponse.json()
        setCenters(centersData || [])

        // Calculate stats
        const avgRating = centersData.length > 0 
          ? centersData.reduce((sum: number, c: Center) => sum + (c.rating || 0), 0) / centersData.length 
          : 0

        setStats({
          totalCenters: centersData.length,
          totalBookings: 0, // TODO: Get from bookings API
          todayBookings: 0, // TODO: Get from bookings API
          monthlyEarnings: 0, // TODO: Get from bookings API
          avgRating: Math.round(avgRating * 10) / 10
        })
      }

      // TODO: Get bookings for all centers when bookings API is ready

    } catch (error: any) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/partner/login")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getOperatingHoursText = (operatingHours: any) => {
    if (!operatingHours) return "Not specified"
    
    // Convert operating hours object to readable text
    const days = Object.keys(operatingHours)
    if (days.length === 0) return "Not specified"
    
    // Show first day as example
    const firstDay = operatingHours[days[0]]
    if (firstDay?.closed) return "Varies"
    
    return `${firstDay?.start || '09:00'} - ${firstDay?.end || '18:00'}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA1A7] mx-auto mb-4"></div>
          <p className="text-[#5B6B7A]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Partner Profile Not Found</h2>
            <p className="text-[#5B6B7A] mb-4">
              Your partner profile could not be found. Let's set it up!
            </p>
            <Button 
              onClick={() => router.push("/partner/onboarding")}
              className="bg-[#0AA1A7] hover:bg-[#089098]"
            >
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1B2B]">{partner.business_name}</h1>
              <p className="text-[#5B6B7A]">Partner Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={partner.status === "approved" ? "default" : "secondary"}>
                {partner.status === "approved" ? "Approved" : "Pending Approval"}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AA1A7]/10">
                <Building2 className="h-5 w-5 text-[#0AA1A7]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{stats.totalCenters}</div>
                <div className="text-sm text-[#5B6B7A]">Centers</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{stats.totalBookings}</div>
                <div className="text-sm text-[#5B6B7A]">Total Bookings</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{stats.todayBookings}</div>
                <div className="text-sm text-[#5B6B7A]">Today</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{formatCurrency(stats.monthlyEarnings)}</div>
                <div className="text-sm text-[#5B6B7A]">This Month</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{stats.avgRating}</div>
                <div className="text-sm text-[#5B6B7A]">Avg Rating</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="centers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="centers">My Centers</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="centers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0B1B2B]">Your Medical Centers</h2>
              <Button 
                className="bg-[#0AA1A7] hover:bg-[#089098]"
                onClick={() => router.push("/partner/centers/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Center
              </Button>
            </div>

            {centers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Centers Found</h3>
                  <p className="text-[#5B6B7A] mb-4">
                    You haven't added any medical centers yet. Complete your onboarding to add your first center.
                  </p>
                  <Button 
                    className="bg-[#0AA1A7] hover:bg-[#089098]"
                    onClick={() => router.push("/partner/onboarding")}
                  >
                    Complete Onboarding
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {centers.map((center) => (
                  <Card key={center.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{center.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {center.address}, {center.city}
                          </CardDescription>
                          {center.area_hint && (
                            <CardDescription className="mt-1 text-sm">
                              {center.area_hint}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={center.is_active ? "default" : "secondary"}>
                          {center.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-[#5B6B7A]" />
                          <span>{center.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{center.rating}/5.0 rating</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-[#5B6B7A]" />
                          <span>{getOperatingHoursText(center.operating_hours)}</span>
                        </div>
                        {center.amenities && center.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {center.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {center.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{center.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`/partner/centers/${center.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`/partner/centers/${center.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest bookings across all your centers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-[#5B6B7A]">
                    Your bookings will appear here once patients start booking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Profile</CardTitle>
                <CardDescription>
                  Your business information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#5B6B7A]">Business Name</label>
                    <p className="text-base font-semibold">{partner.business_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5B6B7A]">Status</label>
                    <p className="text-base font-semibold">
                      <Badge variant={partner.status === "approved" ? "default" : "secondary"}>
                        {partner.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5B6B7A]">Business Email</label>
                    <p className="text-base">{partner.business_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5B6B7A]">Business Phone</label>
                    <p className="text-base">{partner.business_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-[#5B6B7A]">Address</label>
                    <p className="text-base">{partner.business_address}, {partner.city}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => router.push("/partner/profile/edit")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



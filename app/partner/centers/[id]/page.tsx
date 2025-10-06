"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Star, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Edit,
  Settings,
  ArrowLeft,
  Plus,
  Eye,
  TrendingUp
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/hooks/use-toast";

interface CenterDetails {
  id: number
  name: string
  address: string
  city: string
  area_hint: string
  phone: string
  email: string
  rating: number
  is_active: boolean
  operating_hours: any
  amenities: string[]
  center_services: any[]
}

interface BookingStats {
  total: number
  confirmed: number
  pending: number
  completed: number
  cancelled: number
  totalRevenue: number
  todayBookings: number
}

interface Booking {
  id: string
  appointment_date: string
  status: string
  total_amount: number
  users: {
    full_name: string
    phone: string
    email: string
  }
  services: {
    name: string
  }
}

export default function CenterDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [center, setCenter] = useState<CenterDetails | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0,
    totalRevenue: 0, todayBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCenterData();
  }, [params.id]);

  const fetchCenterData = async () => {
    try {
      setLoading(true);
      
      const authToken = (await supabase.auth.getSession()).data.session?.access_token;
      
      // Fetch center details
      const centerResponse = await fetch(`/api/partner/centers/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      
      if (!centerResponse.ok) {
        throw new Error("Failed to fetch center details");
      }
      
      const centerData = await centerResponse.json();
      setCenter(centerData.center);
      
      // Fetch bookings for this center
      const bookingsResponse = await fetch(`/api/partner/centers/${params.id}/bookings`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
        setBookingStats(bookingsData.stats || bookingStats);
      }
      
    } catch (error: any) {
      console.error("Error fetching center data:", error);
      toast({
        title: "Error",
        description: "Failed to load center details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getOperatingHoursText = (operatingHours: any) => {
    if (!operatingHours) return "Not specified";
    
    const days = Object.keys(operatingHours);
    if (days.length === 0) return "Not specified";
    
    const firstDay = operatingHours[days[0]];
    if (firstDay?.closed) return "Varies by day";
    
    return `${firstDay?.start || "09:00"} - ${firstDay?.end || "18:00"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA1A7] mx-auto mb-4"></div>
          <p className="text-[#5B6B7A]">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Center Not Found</h2>
            <p className="text-[#5B6B7A] mb-4">
              The center you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/partner/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/partner/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#0B1B2B]">{center.name}</h1>
                <div className="flex items-center gap-2 text-[#5B6B7A]">
                  <MapPin className="h-4 w-4" />
                  <span>{center.address}, {center.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={center.is_active ? "default" : "secondary"}>
                {center.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/partner/centers/${params.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Center
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{bookingStats.total}</div>
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
                <div className="text-2xl font-bold text-[#0B1B2B]">{bookingStats.todayBookings}</div>
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
                <div className="text-2xl font-bold text-[#0B1B2B]">{formatCurrency(bookingStats.totalRevenue)}</div>
                <div className="text-sm text-[#5B6B7A]">Revenue</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B1B2B]">{center.rating}</div>
                <div className="text-sm text-[#5B6B7A]">Rating</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Center Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Center Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#5B6B7A]" />
                      <span>{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#5B6B7A]" />
                      <span>{center.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#5B6B7A]" />
                      <span>{getOperatingHoursText(center.operating_hours)}</span>
                    </div>
                    {center.area_hint && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-[#5B6B7A] mt-0.5" />
                        <span className="text-sm">{center.area_hint}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  {center.amenities && center.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {center.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#5B6B7A]">No amenities specified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activity for this center</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{booking.users.full_name}</p>
                            <p className="text-sm text-[#5B6B7A]">{booking.services.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <p className="text-sm text-[#5B6B7A] mt-1">
                            {formatDate(booking.appointment_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#5B6B7A] text-center py-8">No recent bookings</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Services & Pricing</CardTitle>
                  <CardDescription>Manage services offered at this center</CardDescription>
                </div>
                <Button 
                  onClick={() => router.push(`/partner/centers/${params.id}/services/add`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </CardHeader>
              <CardContent>
                {center.center_services && center.center_services.length > 0 ? (
                  <div className="space-y-4">
                    {center.center_services.map((centerService) => (
                      <div key={centerService.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{centerService.services?.name}</h4>
                          <p className="text-sm text-[#5B6B7A]">{centerService.services?.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-[#5B6B7A]" />
                            <span className="text-xs text-[#5B6B7A]">
                              {centerService.services?.duration_minutes || 30} mins
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-[#0AA1A7]">
                              ₹{centerService.price}
                            </span>
                            {centerService.special_price && (
                              <span className="text-sm text-red-600 line-through">
                                ₹{centerService.special_price}
                              </span>
                            )}
                          </div>
                          <Badge variant={centerService.is_available ? "default" : "secondary"} className="mt-1">
                            {centerService.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-[#5B6B7A]">No services configured for this center</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Complete booking history for this center</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.users.full_name}</div>
                              <div className="text-sm text-[#5B6B7A]">{booking.users.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.services.name}</TableCell>
                          <TableCell>{formatDate(booking.appointment_date)}</TableCell>
                          <TableCell>{formatCurrency(booking.total_amount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-[#5B6B7A]">No bookings found for this center</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Center Settings</CardTitle>
                <CardDescription>Manage center configuration and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Center Status</h4>
                    <p className="text-sm text-[#5B6B7A]">Enable or disable this center for new bookings</p>
                  </div>
                  <Badge variant={center.is_active ? "default" : "secondary"}>
                    {center.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/partner/centers/${params.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/partner/centers/${params.id}/hours`)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Operating Hours
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, IndianRupee, Eye, Phone } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  patientName: string
  service: {
    name: string
    price: number
    category: string
  }
  center: {
    name: string
    address: string
    phone: string
  }
}

export default function BookingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadUserAndBookings = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/signin");
        return;
      }
      setUser(currentUser);
      await fetchBookings(currentUser.id);
    };
    loadUserAndBookings();
  }, [router]);

  const fetchBookings = async (userId: string) => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your radiology appointments</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">You haven't made any appointments yet.</p>
              <Button asChild>
                <Link href="/book">Book Your First Appointment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{booking.service.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Badge variant="secondary" className="mr-2">
                          {booking.service.category}
                        </Badge>
                        <span>Patient: {booking.patientName}</span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(booking.status)} text-white`}>
                        {booking.status.toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-lg font-bold text-blue-600 mt-2">
                        <IndianRupee className="h-4 w-4" />
                        {booking.service.price}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{booking.time}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{booking.center.name}</div>
                          <div className="text-sm">{booking.center.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{booking.center.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button asChild variant="outline">
                      <Link href={`/confirm/${booking.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

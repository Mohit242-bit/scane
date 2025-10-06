"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  IndianRupee,
  Download,
  Share2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";

export default function ConfirmPage() {
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings?id=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "ScanEzy Booking Confirmation",
      text: `Booking confirmed for ${booking?.patientName} - ${booking?.serviceId} on ${booking?.date} at ${booking?.time}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Booking confirmation link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownload = () => {
    // Create a simple text receipt
    const receipt = `
SCANEZY BOOKING CONFIRMATION
============================

Booking ID: ${booking?.id}
Patient: ${booking?.patientName}
Service: ${booking?.serviceId}
Date: ${booking?.date}
Time: ${booking?.time}
Status: ${booking?.status}
Amount: ₹${booking?.totalAmount}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scanezy-booking-${booking?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked. We've sent you a confirmation.
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Booking Details</CardTitle>
                <CardDescription>Booking ID: {booking.id}</CardDescription>
              </div>
              <Badge
                className={
                  booking.status === "confirmed"
                    ? "bg-green-600"
                    : booking.status === "pending"
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                }
              >
                {booking.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service & Center Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{booking.serviceId}</p>
                    <div className="flex items-center text-lg font-bold text-green-600">
                      <IndianRupee className="h-4 w-4" />
                      {(booking.totalAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Appointment</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(booking.date).toLocaleDateString("en-US", {
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
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Center Details</h3>
                  <div className="space-y-2">
                    <p className="font-semibold">{booking.centerId}</p>
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Location details will be provided</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {booking.patientName}, {booking.patientAge} years
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{booking.patientPhone}</span>
                    </div>
                    {booking.patientEmail && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{booking.patientEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{booking.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share Booking
          </Button>
          <Button asChild className="flex-1">
            <Link href="/book">Book Another Appointment</Link>
          </Button>
        </div>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Arrive 15 minutes early</p>
                <p className="text-sm text-gray-600">Please arrive at least 15 minutes before your appointment time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Bring valid ID</p>
                <p className="text-sm text-gray-600">Carry a government-issued photo ID for verification</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Follow preparation instructions</p>
                <p className="text-sm text-gray-600">Check if your scan requires any special preparation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

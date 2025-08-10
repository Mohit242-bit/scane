"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, Calendar, MapPin, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import LoadingSpinner from "@/components/loading-spinner"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    }
  }, [session])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        },
      })

      setEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    })
    setEditing(false)
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-4">Profile</h1>
          <p className="text-[#5B6B7A] text-lg">Manage your account information and preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0B1B2B]">Personal Information</CardTitle>
                  <CardDescription className="text-[#5B6B7A]">Update your personal details</CardDescription>
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={loading}>
                      {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name?.charAt(0) || session?.user?.phone?.slice(-2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-[#0B1B2B]">{session?.user?.name || "User"}</div>
                  <div className="text-sm text-[#5B6B7A]">Member since {new Date().getFullYear()}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-[#F5F7FA]">
                      <User className="h-4 w-4 text-[#5B6B7A]" />
                      <span className="text-[#0B1B2B]">{session?.user?.name || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-[#F5F7FA]">
                    <Phone className="h-4 w-4 text-[#5B6B7A]" />
                    <span className="text-[#0B1B2B]">+91 {session?.user?.phone}</span>
                    <Badge variant="secondary" className="ml-auto">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-[#5B6B7A]">Phone number cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-[#F5F7FA]">
                      <Mail className="h-4 w-4 text-[#5B6B7A]" />
                      <span className="text-[#0B1B2B]">{session?.user?.email || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Account Statistics</CardTitle>
                <CardDescription className="text-[#5B6B7A]">Your booking history and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#0AA1A7]" />
                    <span className="text-sm text-[#5B6B7A]">Total Bookings</span>
                  </div>
                  <span className="font-semibold text-[#0B1B2B]">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#0AA1A7]" />
                    <span className="text-sm text-[#5B6B7A]">Favorite City</span>
                  </div>
                  <span className="font-semibold text-[#0B1B2B]">-</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#0B1B2B]">Quick Actions</CardTitle>
                <CardDescription className="text-[#5B6B7A]">Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <a href="/book">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book New Appointment
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <a href="/bookings">
                    <Calendar className="mr-2 h-4 w-4" />
                    View My Bookings
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <a href="/support">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

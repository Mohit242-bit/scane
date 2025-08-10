"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Star, Search } from "lucide-react"
import Link from "next/link"
import { centers, services } from "@/lib/data"

export default function CentersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCenters = useMemo(() => {
    return centers.filter(
      (center) =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.area_hint.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.name : serviceId
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Diagnostic Centers</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find trusted diagnostic centers near you with state-of-the-art equipment and experienced professionals
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by center name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            {filteredCenters.length} center{filteredCenters.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCenters.map((center) => (
            <Card key={center.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{center.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {center.area_hint}
                    </CardDescription>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{center.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {center.address}, {center.city}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{center.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{center.timings}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Services</h4>
                  <div className="flex flex-wrap gap-1">
                    {center.services.slice(0, 4).map((serviceId) => (
                      <Badge key={serviceId} variant="outline" className="text-xs">
                        {services.find((s) => s.id === serviceId)?.category || serviceId}
                      </Badge>
                    ))}
                    {center.services.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{center.services.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/book?center=${center.id}`}>Book Appointment</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/centers/${center.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No centers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-blue-50 p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-gray-600 mb-6">
              Contact us and we'll help you find the right diagnostic center for your needs
            </p>
            <Button asChild>
              <Link href="/contact">Get Help</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Star, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Book Your <span className="text-blue-600">Radiology</span> Appointments Online
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Fast, convenient, and reliable diagnostic services. Book your X-ray, CT scan, MRI, and more with just a
                few clicks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/book">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/radiology-reception.png"
                alt="Modern radiology center reception"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose ScanEzy?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make medical imaging accessible, convenient, and stress-free for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Quick Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book your appointment in under 2 minutes. No lengthy forms or waiting on hold.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Certified Centers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All our partner centers are NABH accredited with state-of-the-art equipment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Expert Radiologists</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reports reviewed by experienced radiologists with quick turnaround times.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive diagnostic imaging services at your fingertips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "X-Ray",
                description: "Digital X-ray imaging for bones, chest, and more",
                price: "Starting from ₹800",
                duration: "15 mins",
                popular: false,
              },
              {
                name: "CT Scan",
                description: "Advanced computed tomography scans",
                price: "Starting from ₹3,500",
                duration: "30 mins",
                popular: true,
              },
              {
                name: "MRI",
                description: "High-resolution magnetic resonance imaging",
                price: "Starting from ₹8,000",
                duration: "45 mins",
                popular: false,
              },
              {
                name: "Ultrasound",
                description: "Safe and non-invasive ultrasound examinations",
                price: "Starting from ₹1,200",
                duration: "20 mins",
                popular: false,
              },
              {
                name: "Mammography",
                description: "Specialized breast cancer screening",
                price: "Starting from ₹2,500",
                duration: "25 mins",
                popular: false,
              },
              {
                name: "PET Scan",
                description: "Positron emission tomography for detailed imaging",
                price: "Starting from ₹25,000",
                duration: "60 mins",
                popular: false,
              },
            ].map((service, index) => (
              <Card key={index} className="relative">
                {service.popular && <Badge className="absolute -top-2 -right-2 bg-orange-500">Popular</Badge>}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {service.name}
                    <span className="text-sm font-normal text-gray-500">{service.duration}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{service.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-blue-600">{service.price}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/book">Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Centers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Centers</h2>
            <p className="text-xl text-gray-600">Conveniently located across the city</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "ScanEzy Central",
                address: "123 Medical Plaza, Downtown",
                city: "Mumbai",
                rating: 4.8,
                reviews: 245,
              },
              {
                name: "ScanEzy North",
                address: "456 Health Avenue, Andheri",
                city: "Mumbai",
                rating: 4.6,
                reviews: 189,
              },
              {
                name: "ScanEzy South",
                address: "789 Care Street, Bandra",
                city: "Mumbai",
                rating: 4.7,
                reviews: 203,
              },
            ].map((center, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {center.name}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm">{center.rating}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{center.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{center.reviews} reviews</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                    <Link href="/centers">View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/centers">Find Centers Near You</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied patients who trust ScanEzy for their diagnostic needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/book">
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

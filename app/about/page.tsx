import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Users, Award, Shield, Clock, MapPin, CheckCircle, Heart, Target } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    { label: "Happy Patients", value: "10,000+", icon: Users },
    { label: "Partner Centers", value: "50+", icon: MapPin },
    { label: "Services Available", value: "25+", icon: Stethoscope },
    { label: "Years of Experience", value: "5+", icon: Award },
  ]

  const values = [
    {
      icon: Heart,
      title: "Patient-Centric Care",
      description: "We put patients first, ensuring comfort, convenience, and quality care at every step.",
    },
    {
      icon: Shield,
      title: "Trust & Reliability",
      description: "Partner with only certified, accredited diagnostic centers with proven track records.",
    },
    {
      icon: Target,
      title: "Accessibility",
      description: "Making healthcare accessible to everyone with transparent pricing and easy booking.",
    },
    {
      icon: Clock,
      title: "Efficiency",
      description: "Streamlined processes that save time for both patients and healthcare providers.",
    },
  ]

  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Chief Medical Officer",
      experience: "15+ years in Radiology",
      image: "/placeholder.svg?height=200&width=200&text=Dr.+Rajesh",
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      experience: "10+ years in Healthcare",
      image: "/placeholder.svg?height=200&width=200&text=Priya",
    },
    {
      name: "Amit Patel",
      role: "Technology Director",
      experience: "12+ years in HealthTech",
      image: "/placeholder.svg?height=200&width=200&text=Amit",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">ScanEzy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're on a mission to make radiology services accessible, affordable, and convenient for everyone.
              Connecting patients with trusted diagnostic centers across the country.
            </p>
            <Button asChild size="lg">
              <Link href="/book">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  ScanEzy was born from a simple observation: getting a radiology scan shouldn't be complicated,
                  expensive, or time-consuming. Our founders, having experienced the frustrations of traditional
                  healthcare booking systems, set out to create a better way.
                </p>
                <p>
                  Since our launch in 2019, we've helped thousands of patients access quality diagnostic services across
                  India. We've built partnerships with the most trusted diagnostic centers, ensuring that every scan
                  booked through our platform meets the highest standards of quality and safety.
                </p>
                <p>
                  Today, ScanEzy is more than just a booking platform – we're a healthcare companion that guides
                  patients through their diagnostic journey with transparency, care, and convenience.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600&text=Healthcare+Team"
                alt="Healthcare professionals"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600">Meet the experts behind ScanEzy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{member.experience}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ScanEzy?</h2>
            <p className="text-lg text-gray-600">What makes us different from traditional booking methods</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
                  <p className="text-gray-600">
                    No hidden fees or surprise charges. See exactly what you'll pay upfront.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                  <p className="text-gray-600">
                    All partner centers are verified, accredited, and regularly audited for quality.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Our customer support team is available round the clock to assist you.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Rescheduling</h3>
                  <p className="text-gray-600">Need to change your appointment? Do it easily through our platform.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Digital Reports</h3>
                  <p className="text-gray-600">Get your reports digitally and share them easily with your doctors.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Insurance Support</h3>
                  <p className="text-gray-600">We help you navigate insurance claims and cashless treatments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied patients who trust ScanEzy for their diagnostic needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/book">Book Your Scan</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

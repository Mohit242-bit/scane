import Link from "next/link"
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
  AlertTriangle
} from "lucide-react"

// This would normally come from your API
const mockStats = {
  totalBookings: 1247,
  todayBookings: 23,
  activePartners: 42,
  pendingApprovals: 7,
  revenue: 324567,
  monthlyGrowth: 12.5
}

const recentActivity = [
  {
    id: 1,
    type: "booking",
    description: "New booking by John Doe for MRI scan",
    time: "2 minutes ago",
    status: "pending"
  },
  {
    id: 2,
    type: "partner",
    description: "DiagnoTech Labs submitted partnership application",
    time: "15 minutes ago",
    status: "pending"
  },
  {
    id: 3,
    type: "booking",
    description: "Booking completed - X-Ray at City Medical",
    time: "1 hour ago",
    status: "completed"
  },
  {
    id: 4,
    type: "issue",
    description: "Payment failed for booking #1234",
    time: "2 hours ago",
    status: "error"
  }
]

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Admin Panel</h1>
          <p className="text-[#5B6B7A]">Welcome to MedEzy administration dashboard</p>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Total Bookings</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{mockStats.totalBookings}</p>
                <p className="text-xs text-green-600">+{mockStats.todayBookings} today</p>
              </div>
              <CalendarDays className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Active Partners</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{mockStats.activePartners}</p>
                <p className="text-xs text-orange-600">{mockStats.pendingApprovals} pending</p>
              </div>
              <Users className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Revenue</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">₹{mockStats.revenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{mockStats.monthlyGrowth}% this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#0AA1A7]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#5B6B7A]">Pending Actions</p>
                <p className="text-2xl font-bold text-[#0B1B2B]">{mockStats.pendingApprovals}</p>
                <p className="text-xs text-red-600">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/dashboard">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Main Dashboard</h3>
              <p className="text-sm text-[#5B6B7A]">Comprehensive analytics and management</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tables">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Database Tables</h3>
              <p className="text-sm text-[#5B6B7A]">View and edit all Supabase tables</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard?tab=bookings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CalendarDays className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Manage Bookings</h3>
              <p className="text-sm text-[#5B6B7A]">View and update appointments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard?tab=partners">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <UserCheck className="h-12 w-12 text-[#0AA1A7] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Partner Approvals</h3>
              <p className="text-sm text-[#5B6B7A]">Review partnership applications</p>
              {mockStats.pendingApprovals > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {mockStats.pendingApprovals} pending
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0">
                    {activity.type === "booking" && (
                      <CalendarDays className="h-5 w-5 text-[#0AA1A7]" />
                    )}
                    {activity.type === "partner" && (
                      <Users className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.type === "issue" && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
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
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key metrics and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Payment Gateway</span>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">SMS Service</span>
                </div>
                <Badge variant="outline">Degraded</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Email Service</span>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-[#5B6B7A] mb-2">Server Load</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0AA1A7] h-2 rounded-full" style={{width: "35%"}}></div>
                </div>
                <div className="text-xs text-[#5B6B7A] mt-1">35% - Normal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AdminGuard>
  )
}
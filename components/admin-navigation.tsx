"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Settings, 
  LogOut, 
  Shield,
  Home
} from "lucide-react";

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<string | null>(null);

  useEffect(() => {
    // Check admin status on mount
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/mvp-verify");
        const data = await response.json();
        if (data.isAdmin) {
          setAdminUser(data.user);
        }
      } catch (error) {
        // Not admin, navigation won't show
      }
    };
    
    if (pathname.startsWith("/admin")) {
      checkAdmin();
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/mvp-verify", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/admin/login");
    }
  };

  if (!pathname.startsWith("/admin") || !adminUser) {
    return null;
  }

  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true
    },
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      href: "/admin/tables",
      label: "Database Tables",
      icon: Database
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#0AA1A7] flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#0B1B2B]">Admin Portal</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href) && pathname !== "/admin";
              
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[#0AA1A7] text-white"
                      : "text-[#5B6B7A] hover:text-[#0B1B2B] hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                Admin
              </Badge>
              <span className="text-sm text-[#5B6B7A]">
                {adminUser}
              </span>
            </div>
            
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Main Site
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

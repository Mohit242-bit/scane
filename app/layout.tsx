import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ScanEzy - Book Radiology Appointments Online",
  description:
    "Fast, convenient, and reliable diagnostic services. Book your X-ray, CT scan, MRI, and more with just a few clicks.",
  keywords: "radiology, diagnostic, X-ray, CT scan, MRI, ultrasound, mammography, medical imaging",
  authors: [{ name: "ScanEzy Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}

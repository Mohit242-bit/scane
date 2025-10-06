import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import AuthSessionProvider from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport = "width=device-width, initial-scale=1";
export const metadata: Metadata = {
  title: "ScanEzy - Book Radiology Appointments Online",
  description:
    "Fast, convenient, and reliable diagnostic services. Book your X-ray, CT scan, MRI, and more with just a few clicks.",
  keywords: "radiology, diagnostic, X-ray, CT scan, MRI, ultrasound, mammography, medical imaging",
  authors: [{ name: "ScanEzy Team" }],
  generator: "v0.dev"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}

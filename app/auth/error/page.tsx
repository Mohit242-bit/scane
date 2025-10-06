"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during sign in.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const customMessage = searchParams.get("message");
  const message = customMessage || errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0B1B2B]">Sign In Error</CardTitle>
          <CardDescription className="text-[#5B6B7A]">We encountered an issue while signing you in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {/* Show debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <Alert>
              <AlertDescription className="text-xs">
                Debug: error={error}, message={customMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full bg-[#0AA1A7] hover:bg-[#089098]">
              <Link href="/partner/login">Try Partner Login Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/signin">Regular Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-[#5B6B7A]">
            If the problem persists, please contact{" "}
            <a href="mailto:support@scanezy.com" className="underline hover:text-[#0AA1A7]">
              support@scanezy.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Chrome, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function OAuthTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const runOAuthTest = async () => {
    setIsLoading(true);
    setTestResults({});
    
    const results: any = {
      environment: {},
      oauthTest: {},
      errors: []
    };

    try {
      // Test environment variables
      results.environment = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ SET" : "✗ MISSING",
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ SET" : "✗ MISSING",
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      };

      // Test OAuth provider availability
      try {
        const redirectTo = `${window.location.origin}/api/auth/callback?redirectTo=/partner/oauth-test`;
        
        console.log("Testing OAuth with redirect:", redirectTo);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            queryParams: {
              access_type: "offline",
              prompt: "none" // Use 'none' to avoid actual redirect during test
            }
          }
        });

        results.oauthTest = {
          success: !error,
          hasUrl: !!data?.url,
          url: data?.url,
          error: error?.message,
          data: data
        };

        if (error) {
          results.errors.push(`OAuth Error: ${error.message}`);
        }

      } catch (oauthError: any) {
        results.oauthTest = {
          success: false,
          error: oauthError.message,
          stack: oauthError.stack
        };
        results.errors.push(`OAuth Exception: ${oauthError.message}`);
      }

      // Test Supabase connection
      try {
        const { data: { user } } = await supabase.auth.getUser();
        results.connection = {
          canConnect: true,
          currentUser: user?.id || null
        };
      } catch (connectionError: any) {
        results.connection = {
          canConnect: false,
          error: connectionError.message
        };
        results.errors.push(`Connection Error: ${connectionError.message}`);
      }

    } catch (generalError: any) {
      results.errors.push(`General Error: ${generalError.message}`);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const actuallyTryOAuth = async () => {
    try {
      const redirectTo = `${window.location.origin}/api/auth/callback?redirectTo=/partner/oauth-test`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        }
      });

      if (error) {
        alert(`OAuth Error: ${error.message}`);
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("No OAuth URL returned");
      }
    } catch (error: any) {
      alert(`OAuth Exception: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0AA1A7]/5 to-[#B7F171]/5 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0B1B2B]">OAuth Configuration Test</CardTitle>
            <CardDescription>
              This page helps diagnose Google OAuth setup issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={runOAuthTest}
                disabled={isLoading}
                className="bg-[#0AA1A7] hover:bg-[#089098]"
              >
                <Info className="mr-2 h-4 w-4" />
                {isLoading ? "Running Tests..." : "Run Diagnostic Tests"}
              </Button>
              
              <Button 
                onClick={actuallyTryOAuth}
                variant="outline"
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Actually Try Google OAuth
              </Button>
            </div>

            {testResults && (
              <div className="space-y-4 mt-6">
                {/* Environment Variables */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResults.environment, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {/* OAuth Test Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">OAuth Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(testResults.oauthTest, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {/* Connection Test */}
                {testResults.connection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supabase Connection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                        {JSON.stringify(testResults.connection, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Errors */}
                {testResults.errors && testResults.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">Errors Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testResults.errors.map((error: string, index: number) => (
                        <Alert key={index} variant="destructive" className="mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Success */}
                {testResults.errors.length === 0 && testResults.oauthTest?.success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      OAuth configuration appears to be working correctly!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, CheckCircle, AlertCircle } from "lucide-react";

interface BreakpointTest {
  name: string
  minWidth: number
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const breakpoints: BreakpointTest[] = [
  { name: "Mobile", minWidth: 320, icon: Smartphone, description: "Small mobile devices" },
  { name: "Mobile L", minWidth: 425, icon: Smartphone, description: "Large mobile devices" },
  { name: "Tablet", minWidth: 768, icon: Tablet, description: "Tablet devices" },
  { name: "Desktop", minWidth: 1024, icon: Monitor, description: "Desktop screens" },
  { name: "Desktop L", minWidth: 1440, icon: Monitor, description: "Large desktop screens" },
];

export default function ResponsiveTest() {
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("");

  useEffect(() => {
    const updateWidth = () => {
      setCurrentWidth(window.innerWidth);

      // Determine current breakpoint
      const activeBreakpoint = breakpoints
        .slice()
        .reverse()
        .find((bp) => window.innerWidth >= bp.minWidth);

      setCurrentBreakpoint(activeBreakpoint?.name || "Unknown");
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isBreakpointActive = (minWidth: number) => currentWidth >= minWidth;

  if (typeof window === "undefined") {
    return null; // Don't render on server
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2 border-[#0AA1A7]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Responsive Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B6B7A]">Current Width:</span>
          <Badge variant="outline">{currentWidth}px</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B6B7A]">Active Breakpoint:</span>
          <Badge className="bg-[#0AA1A7] text-white">{currentBreakpoint}</Badge>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-[#0B1B2B]">Breakpoint Status:</div>
          {breakpoints.map((bp) => (
            <div key={bp.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <bp.icon className="h-3 w-3" />
                <span>{bp.name}</span>
                <span className="text-[#5B6B7A]">({bp.minWidth}px+)</span>
              </div>
              {isBreakpointActive(bp.minWidth) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-[#5B6B7A] mb-2">Test Common Layouts:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => window.resizeTo(375, 667)} className="text-xs">
              iPhone
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.resizeTo(768, 1024)} className="text-xs">
              iPad
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

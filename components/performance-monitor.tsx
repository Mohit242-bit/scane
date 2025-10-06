"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    const measurePerformance = () => {
      if (typeof window === "undefined" || !window.performance) return;

      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      const fcp = paint.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0;
      const ttfb = navigation.responseStart - navigation.requestStart;

      // Web Vitals would typically be measured with the web-vitals library
      // For demo purposes, we'll use approximate values
      setMetrics({
        fcp: fcp,
        lcp: fcp + 500, // Approximate
        fid: Math.random() * 100, // Simulated
        cls: Math.random() * 0.1, // Simulated
        ttfb: ttfb,
      });
    };

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
    }

    return () => window.removeEventListener("load", measurePerformance);
  }, []);

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.needs) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (value <= thresholds.needs) return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
    return <AlertTriangle className="h-3 w-3 text-red-600" />;
  };

  if (process.env.NODE_ENV !== "development" || !isVisible || !metrics) {
    return (
      <Button onClick={() => setIsVisible(true)} size="sm" variant="outline" className="fixed bottom-4 left-4 z-50">
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50 shadow-lg border-2 border-[#B7F171]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>First Contentful Paint</span>
            </div>
            <div className="flex items-center gap-1">
              {getScoreIcon(metrics.fcp, { good: 1800, needs: 3000 })}
              <span className={getScoreColor(metrics.fcp, { good: 1800, needs: 3000 })}>
                {Math.round(metrics.fcp)}ms
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Largest Contentful Paint</span>
            </div>
            <div className="flex items-center gap-1">
              {getScoreIcon(metrics.lcp, { good: 2500, needs: 4000 })}
              <span className={getScoreColor(metrics.lcp, { good: 2500, needs: 4000 })}>
                {Math.round(metrics.lcp)}ms
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>First Input Delay</span>
            </div>
            <div className="flex items-center gap-1">
              {getScoreIcon(metrics.fid, { good: 100, needs: 300 })}
              <span className={getScoreColor(metrics.fid, { good: 100, needs: 300 })}>{Math.round(metrics.fid)}ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Cumulative Layout Shift</span>
            </div>
            <div className="flex items-center gap-1">
              {getScoreIcon(metrics.cls * 1000, { good: 100, needs: 250 })}
              <span className={getScoreColor(metrics.cls * 1000, { good: 100, needs: 250 })}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Time to First Byte</span>
            </div>
            <div className="flex items-center gap-1">
              {getScoreIcon(metrics.ttfb, { good: 800, needs: 1800 })}
              <span className={getScoreColor(metrics.ttfb, { good: 800, needs: 1800 })}>
                {Math.round(metrics.ttfb)}ms
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-[#5B6B7A] mb-2">Performance Score:</div>
          <div className="flex justify-center">
            <Badge className="bg-[#B7F171] text-[#0B1B2B]">
              {metrics.fcp <= 1800 && metrics.lcp <= 2500 && metrics.fid <= 100
                ? "Good"
                : metrics.fcp <= 3000 && metrics.lcp <= 4000 && metrics.fid <= 300
                  ? "Needs Improvement"
                  : "Poor"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

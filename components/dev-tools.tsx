"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import ResponsiveTest from "./responsive-test"
import PerformanceMonitor from "./performance-monitor"
import LinkChecker from "./link-checker"

export default function DevTools() {
  const [showTools, setShowTools] = useState(false)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setShowTools(!showTools)}
        size="sm"
        variant="outline"
        className="fixed top-4 left-4 z-50 bg-white shadow-lg"
      >
        <Settings className="h-4 w-4 mr-2" />
        Dev Tools
      </Button>

      {showTools && (
        <>
          <ResponsiveTest />
          <PerformanceMonitor />
          <LinkChecker />
        </>
      )}
    </>
  )
}

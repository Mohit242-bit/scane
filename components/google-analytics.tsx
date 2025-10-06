"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Simple page view tracking for demo
    if (typeof window !== "undefined") {
      console.log(`Page view: ${pathname}`);
    }
  }, [pathname]);

  return null;
}

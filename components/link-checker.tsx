"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface LinkStatus {
  url: string
  status: "checking" | "valid" | "invalid" | "external"
  statusCode?: number
}

export default function LinkChecker() {
  const [links, setLinks] = useState<LinkStatus[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkLinks = async () => {
    if (typeof window === "undefined") return;

    setIsChecking(true);
    const allLinks = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];

    const linkStatuses: LinkStatus[] = allLinks.map((link) => ({
      url: link.href,
      status: link.href.startsWith(window.location.origin) ? "checking" : "external",
    }));

    setLinks(linkStatuses);

    // Check internal links
    for (let i = 0; i < linkStatuses.length; i++) {
      const link = linkStatuses[i];
      if (link.status === "checking") {
        try {
          const response = await fetch(link.url, { method: "HEAD" });
          linkStatuses[i] = {
            ...link,
            status: response.ok ? "valid" : "invalid",
            statusCode: response.status,
          };
        } catch (error) {
          linkStatuses[i] = {
            ...link,
            status: "invalid",
            statusCode: 0,
          };
        }
        setLinks([...linkStatuses]);
      }
    }

    setIsChecking(false);
  };

  const getStatusIcon = (status: LinkStatus["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "invalid":
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case "external":
        return <ExternalLink className="h-3 w-3 text-blue-600" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  const getStatusColor = (status: LinkStatus["status"]) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      case "external":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (process.env.NODE_ENV !== "development" || !isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} size="sm" variant="outline" className="fixed top-4 right-4 z-50">
        <LinkIcon className="h-4 w-4 mr-2" />
        Check Links
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-96 max-h-96 z-50 shadow-lg border-2 border-[#0AA1A7]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Link Checker
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Button onClick={checkLinks} disabled={isChecking} size="sm" className="bg-[#0AA1A7] hover:bg-[#089098]">
            {isChecking ? "Checking..." : "Check All Links"}
          </Button>
          <div className="text-xs text-[#5B6B7A]">{links.length} links found</div>
        </div>

        {links.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {links.map((link, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 rounded border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(link.status)}
                  <span className="truncate" title={link.url}>
                    {link.url.replace(window.location.origin, "")}
                  </span>
                </div>
                <Badge variant="outline" className={getStatusColor(link.status)}>
                  {link.status === "invalid" && link.statusCode ? link.statusCode : link.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t text-xs text-[#5B6B7A]">
          <div className="flex justify-between">
            <span>Valid: {links.filter((l) => l.status === "valid").length}</span>
            <span>Invalid: {links.filter((l) => l.status === "invalid").length}</span>
            <span>External: {links.filter((l) => l.status === "external").length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestButtonPage() {
  const [count, setCount] = useState(0);
  
  console.log("TestButtonPage rendered, count:", count);

  const handleClick = () => {
    console.log("Button clicked! Current count:", count);
    alert("Button clicked! Check console.");
    setCount(count + 1);
  };

  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Button Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Click count: {count}</p>
          
          <Button 
            onClick={handleClick}
            className="w-full"
          >
            Test Button - Click Me
          </Button>
          
          <button 
            onClick={() => {
              console.log("Native button clicked!");
              alert("Native button works!");
            }}
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Native HTML Button
          </button>
          
          <div className="text-sm text-gray-600">
            <p>If the buttons work here, React is fine.</p>
            <p>If they don't work, there's a React/Next.js issue.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
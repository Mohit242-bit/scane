"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface LocationHandlerProps {
  onLocationSet: (location: { city: string; coordinates?: { lat: number; lng: number } }) => void
  trigger?: React.ReactNode
  redirectAfterSelection?: string // Add optional redirect path
}

interface GeolocationCoordinates {
  lat: number
  lng: number
}

const SERVICEABLE_CITIES = [
  { name: "Mumbai", slug: "mumbai" },
  { name: "Delhi", slug: "delhi" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Chennai", slug: "chennai" },
  { name: "Pune", slug: "pune" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Ahmedabad", slug: "ahmedabad" },
];

export default function LocationHandler({ onLocationSet, trigger, redirectAfterSelection }: LocationHandlerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"permission" | "selecting" | "manual" | "checking" | "result">("permission");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [detectedCity, setDetectedCity] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if location is already set in localStorage
    const savedLocation = localStorage.getItem("scanezy_location");
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        onLocationSet(location);
      } catch (error) {
        console.error("Error parsing saved location:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocationPermission = async () => {
    setLoading(true);
    setError("");
    setStep("checking");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setStep("manual");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coordinates);
        
        // Try to detect city from coordinates
        try {
          const city = await detectCityFromCoordinates(coordinates);
          setDetectedCity(city);
          
          // Check if city is serviceable
          const serviceable = SERVICEABLE_CITIES.some(c => 
            c.name.toLowerCase() === city.toLowerCase() || 
            c.slug.toLowerCase() === city.toLowerCase()
          );
          
          setIsServiceable(serviceable);
          setStep("result");
          
          if (serviceable) {
            const locationData = { city, coordinates };
            localStorage.setItem("scanezy_location", JSON.stringify(locationData));
            onLocationSet(locationData);
          }
          
        } catch (error) {
          console.error("Error detecting city:", error);
          setError("Unable to detect your city. Please select manually.");
          setStep("manual");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Location access denied. Please select your city manually.";
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please select your city manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable. Please select your city manually.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please select your city manually.";
        }
        
        setError(errorMessage);
        setStep("manual");
        setLoading(false);
      }
    );
  };

  const detectCityFromCoordinates = async (coordinates: GeolocationCoordinates): Promise<string> => {
    // For demo purposes, return a mock city based on coordinates
    // In production, you would use a reverse geocoding service like Google Maps API
    
    // Mock detection logic (replace with actual reverse geocoding)
    const mumbaiCenter = { lat: 19.0760, lng: 72.8777 };
    const delhiCenter = { lat: 28.6139, lng: 77.2090 };
    const bangaloreCenter = { lat: 12.9716, lng: 77.5946 };
    
    const distance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    };
    
    const mumbaiDist = distance(coordinates.lat, coordinates.lng, mumbaiCenter.lat, mumbaiCenter.lng);
    const delhiDist = distance(coordinates.lat, coordinates.lng, delhiCenter.lat, delhiCenter.lng);
    const bangaloreDist = distance(coordinates.lat, coordinates.lng, bangaloreCenter.lat, bangaloreCenter.lng);
    
    if (mumbaiDist <= delhiDist && mumbaiDist <= bangaloreDist) {
      return "Mumbai";
    } else if (delhiDist <= bangaloreDist) {
      return "Delhi";
    } else {
      return "Bangalore";
    }
  };

  const handleManualCitySelection = () => {
    if (!selectedCity) {
      setError("Please select a city");
      return;
    }

    const cityData = SERVICEABLE_CITIES.find(c => c.slug === selectedCity);
    if (!cityData) {
      setError("Selected city is not serviceable");
      return;
    }

    const locationData = { city: cityData.name };
    localStorage.setItem("scanezy_location", JSON.stringify(locationData));
    onLocationSet(locationData);
    setIsOpen(false);
    setError("");
    
    // Redirect if path is provided
    if (redirectAfterSelection) {
      router.push(redirectAfterSelection);
    }
  };

  const handleContinueWithService = () => {
    if (detectedCity) {
      const locationData = { city: detectedCity, coordinates: userLocation || undefined };
      localStorage.setItem("scanezy_location", JSON.stringify(locationData));
      onLocationSet(locationData);
      setIsOpen(false);
      
      // Redirect if path is provided
      if (redirectAfterSelection) {
        router.push(redirectAfterSelection);
      }
    }
  };

  const resetFlow = () => {
    setStep("permission");
    setError("");
    setUserLocation(null);
    setDetectedCity("");
    setSelectedCity("");
    setIsServiceable(null);
    setLoading(false);
  };

  const renderContent = () => {
    switch (step) {
      case "permission":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enable Location Access</h3>
              <p className="text-gray-600 mb-6">
                Allow us to detect your location to find nearby diagnostic centers and check service availability.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={requestLocationPermission} 
                className="w-full" 
                disabled={loading}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Allow Location Access
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep("manual")} 
                className="w-full"
              >
                Select City Manually
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              We only use your location to provide better service recommendations.
            </p>
          </div>
        );

      case "checking":
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
            <h3 className="text-lg font-semibold">Detecting Your Location...</h3>
            <p className="text-gray-600">Please wait while we find nearby centers.</p>
          </div>
        );

      case "result":
        return (
          <div className="space-y-6">
            {isServiceable ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Great News!</h3>
                <p className="text-gray-600 mb-4">
                  We provide services in <strong>{detectedCity}</strong>. You can book appointments at our partner centers.
                </p>
                <Button onClick={handleContinueWithService} className="w-full">
                  Continue with {detectedCity}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Service Not Available</h3>
                <p className="text-gray-600 mb-4">
                  Unfortunately, we don't currently provide services in <strong>{detectedCity}</strong>.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Please select from our available cities:
                </p>
                <Button variant="outline" onClick={() => setStep("manual")} className="w-full">
                  Choose Available City
                </Button>
              </div>
            )}
            
            <div className="text-center">
              <Button variant="ghost" onClick={resetFlow} className="text-sm">
                Try Different Location
              </Button>
            </div>
          </div>
        );

      case "manual":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select Your City</h3>
              <p className="text-gray-600 mb-6">
                Choose your city from our available service locations.
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICEABLE_CITIES.map((city) => (
                    <SelectItem key={city.slug} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleManualCitySelection} 
                disabled={!selectedCity} 
                className="w-full"
              >
                Continue with Selected City
              </Button>
            </div>
            
            <div className="text-center">
              <Button variant="ghost" onClick={() => setStep("permission")} className="text-sm">
                Try Location Access Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (trigger) {
    return (
      <>
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Location Access</DialogTitle>
              <DialogDescription>
                Help us find the best diagnostic centers near you
              </DialogDescription>
            </DialogHeader>
            {renderContent()}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Access</CardTitle>
        <CardDescription>
          Help us find the best diagnostic centers near you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
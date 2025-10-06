"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Home, 
  Building2, 
  Clock, 
  MapPin, 
  Star, 
  IndianRupee,
  CheckCircle,
  Info,
  Calendar,
  Users
} from "lucide-react";

interface BookingTypeSelectorProps {
  onBookingTypeSelected: (type: BookingType) => void
  selectedTests: SelectedTest[]
  userLocation?: string
}

interface BookingType {
  type: "home_collection" | "lab_visit"
  selectedCenter?: Center
  selectedSlot?: TimeSlot
  additionalFee?: number
}

interface SelectedTest {
  id: string
  name: string
  price: number
  category: string
  homeCollectionAvailable?: boolean
}

interface Center {
  id: string
  name: string
  address: string
  city: string
  rating: number
  distance?: string
  amenities: string[]
}

interface TimeSlot {
  id: string
  date: string
  time: string
  available: boolean
}

// Mock data for demonstration
const NEARBY_CENTERS: Center[] = [
  {
    id: "1",
    name: "ScanEzy Diagnostics - Central",
    address: "123 Medical Plaza, Downtown",
    city: "Mumbai",
    rating: 4.8,
    distance: "2.3 km",
    amenities: ["Parking", "AC Waiting", "Wheelchair Access", "Free WiFi"]
  },
  {
    id: "2", 
    name: "Apollo Diagnostics",
    address: "456 Health Avenue, Andheri",
    city: "Mumbai",
    rating: 4.6,
    distance: "3.7 km",
    amenities: ["Parking", "Cafe", "Online Reports"]
  },
  {
    id: "3",
    name: "Thyrocare Lab",
    address: "789 Care Street, Bandra",
    city: "Mumbai", 
    rating: 4.4,
    distance: "5.1 km",
    amenities: ["Express Service", "Home Collection", "Digital Reports"]
  }
];

const HOME_COLLECTION_SLOTS: TimeSlot[] = [
  { id: "1", date: "Today", time: "06:00 - 08:00", available: true },
  { id: "2", date: "Today", time: "08:00 - 10:00", available: false },
  { id: "3", date: "Tomorrow", time: "06:00 - 08:00", available: true },
  { id: "4", date: "Tomorrow", time: "08:00 - 10:00", available: true },
  { id: "5", date: "Tomorrow", time: "18:00 - 20:00", available: true },
];

export default function BookingTypeSelector({ 
  onBookingTypeSelected, 
  selectedTests, 
  userLocation 
}: BookingTypeSelectorProps) {
  const [bookingType, setBookingType] = useState<"home_collection" | "lab_visit">("lab_visit");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showSlots, setShowSlots] = useState(false);

  const homeCollectionAvailable = selectedTests.every(test => 
    test.homeCollectionAvailable !== false
  );

  const homeCollectionFee = 150;
  const totalTestAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);

  const handleContinue = () => {
    if (bookingType === "lab_visit" && !selectedCenter) {
      return;
    }
    
    if (bookingType === "home_collection" && !selectedSlot) {
      return;
    }

    onBookingTypeSelected({
      type: bookingType,
      selectedCenter: selectedCenter || undefined,
      selectedSlot: selectedSlot || undefined,
      additionalFee: bookingType === "home_collection" ? homeCollectionFee : 0
    });
  };

  const handleCenterSelection = (center: Center) => {
    setSelectedCenter(center);
    setShowSlots(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Choose Collection Method
          </CardTitle>
          <CardDescription>
            Select how you'd prefer to get your tests done
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={bookingType} onValueChange={(value) => {
            setBookingType(value as "home_collection" | "lab_visit");
            setSelectedCenter(null);
            setSelectedSlot(null);
            setShowSlots(false);
          }}>
            {/* Lab Visit Option */}
            <div className={`
              border rounded-lg p-6 cursor-pointer transition-all
              ${bookingType === "lab_visit" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
            `}>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="lab_visit" id="lab_visit" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="lab_visit" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-lg">Visit Lab/Center</span>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                  </Label>
                  <p className="text-gray-600 text-sm mb-3">
                    Visit one of our partner diagnostic centers for your tests
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      No additional fees
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      All tests available
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Immediate results
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Home Collection Option */}
            <div className={`
              border rounded-lg p-6 cursor-pointer transition-all
              ${bookingType === "home_collection" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
              ${!homeCollectionAvailable ? "opacity-50 cursor-not-allowed" : ""}
            `}>
              <div className="flex items-start space-x-3">
                <RadioGroupItem 
                  value="home_collection" 
                  id="home_collection" 
                  className="mt-1"
                  disabled={!homeCollectionAvailable}
                />
                <div className="flex-1">
                  <Label htmlFor="home_collection" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-lg">Home Sample Collection</span>
                      <Badge className="bg-green-100 text-green-800">
                        +₹{homeCollectionFee}
                      </Badge>
                    </div>
                  </Label>
                  <p className="text-gray-600 text-sm mb-3">
                    Our trained phlebotomist will visit your home to collect samples
                  </p>
                  
                  {!homeCollectionAvailable ? (
                    <Alert className="mb-3">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Some selected tests require lab visit and are not available for home collection.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Safe & hygienic
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Convenient timing
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        No travel required
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Center Selection for Lab Visit */}
      {bookingType === "lab_visit" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Diagnostic Center
            </CardTitle>
            <CardDescription>
              Choose a nearby center {userLocation && `in ${userLocation}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {NEARBY_CENTERS.map((center) => (
                <div
                  key={center.id}
                  onClick={() => handleCenterSelection(center)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${selectedCenter?.id === center.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{center.name}</h4>
                        {selectedCenter?.id === center.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{center.address}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{center.rating}</span>
                        </div>
                        {center.distance && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{center.distance}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {center.amenities.slice(0, 3).map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {center.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{center.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slot Selection for Home Collection */}
      {bookingType === "home_collection" && homeCollectionAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Collection Slot
            </CardTitle>
            <CardDescription>
              Choose when you'd like our phlebotomist to visit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {HOME_COLLECTION_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${selectedSlot?.id === slot.id ? "border-blue-500 bg-blue-50" : 
                      slot.available ? "border-gray-200 hover:border-gray-300" : "border-gray-100 bg-gray-50 cursor-not-allowed"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{slot.date}</span>
                        {selectedSlot?.id === slot.id && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{slot.time}</p>
                    </div>
                    <div>
                      {slot.available ? (
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Booked</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Continue */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Test Amount:</span>
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                {totalTestAmount.toLocaleString()}
              </span>
            </div>
            
            {bookingType === "home_collection" && (
              <div className="flex justify-between">
                <span>Home Collection Fee:</span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {homeCollectionFee}
                </span>
              </div>
            )}
            
            <hr />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span className="flex items-center text-blue-600">
                <IndianRupee className="h-5 w-5" />
                {(totalTestAmount + (bookingType === "home_collection" ? homeCollectionFee : 0)).toLocaleString()}
              </span>
            </div>

            {bookingType === "lab_visit" && selectedCenter && (
              <div className="text-sm text-gray-600 mt-4">
                <strong>Selected Center:</strong> {selectedCenter.name}
              </div>
            )}

            {bookingType === "home_collection" && selectedSlot && (
              <div className="text-sm text-gray-600 mt-4">
                <strong>Collection Time:</strong> {selectedSlot.date} at {selectedSlot.time}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={
            (bookingType === "lab_visit" && !selectedCenter) ||
            (bookingType === "home_collection" && (!selectedSlot || !homeCollectionAvailable))
          }
          size="lg"
        >
          Continue to Patient Details
        </Button>
      </div>
    </div>
  );
}
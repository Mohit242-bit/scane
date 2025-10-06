"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "./loading-spinner";

interface RazorpayPaymentProps {
  bookingId: string
  amount: number
  onSuccess: (paymentData: any) => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({ bookingId, amount, onSuccess, onError }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast({
        title: "Payment Error",
        description: "Payment gateway is still loading. Please wait.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ScanEzy",
        description: "Radiology Service Booking",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            onSuccess(verifyData);
          } catch (error) {
            onError(error);
          }
        },
        prefill: {
          name: "Patient",
          email: "",
          contact: "",
        },
        theme: {
          color: "#0AA1A7",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can complete the payment anytime before the slot expires.",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      onError(error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className="w-full h-11 bg-[#0AA1A7] text-white hover:bg-[#089098]"
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount} & Confirm`
      )}
    </Button>
  );
}

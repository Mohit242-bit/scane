"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Booking, Center, Service, Slot } from "@/lib/types";
import { getBookingById } from "@/lib/db";
import { services, seededCentersFor } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [center, setCenter] = useState<Center | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const invoiceNo = useMemo(() => `INV-${id}`, [id]);

  useEffect(() => {
    const b = getBookingById(id);
    if (!b) return;
    setBooking(b);
    const svc = servicesSeed().find((s) => s.id === b.service_id) || null;
    setService(svc);
    const centers = seededCentersFor(b.city_slug);
    const c = centers.find((x) => x.id === b.center_id) || null;
    setCenter(c);
    const allSlots = seededSlotsFor(b.city_slug, svc?.slug || "mri-brain");
    const s = allSlots.find((x) => x.id === b.slot_id) || null;
    setSlot(s);
  }, [id]);

  function printInvoice() {
    window.print();
  }

  if (!booking || !center || !service || !slot) {
    return <main className="min-h-[100svh] bg-[#F5F7FA] p-6">Loading...</main>;
  }

  return (
    <main className="min-h-[100svh] bg-white p-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#0B1B2B]">ScanEzy</div>
            <div className="text-sm text-[#5B6B7A]">Precision made effortless</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#5B6B7A]">Invoice</div>
            <div className="font-semibold text-[#0B1B2B]">{invoiceNo}</div>
          </div>
        </header>
        <Separator className="my-4" />
        <section className="grid gap-3 text-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[#5B6B7A]">Billed To</div>
              <div className="font-medium text-[#0B1B2B]">{booking.user_name || "Patient"}</div>
              <div className="text-[#5B6B7A]">+91 {booking.user_phone}</div>
            </div>
            <div className="text-right">
              <div className="text-[#5B6B7A]">Booking ID</div>
              <div className="font-medium text-[#0B1B2B]">{booking.id}</div>
              <div className="text-[#5B6B7A]">{new Date(booking.created_ts).toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-md border">
            <div className="grid grid-cols-3 gap-2 p-3 text-[#5B6B7A]">
              <div>Service</div>
              <div className="text-center">Center</div>
              <div className="text-right">Amount</div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="font-medium text-[#0B1B2B]">{service.name}</div>
              <div className="text-center text-[#0B1B2B]">{center.name}</div>
              <div className="text-right font-semibold text-[#0B1B2B]">₹{booking.amount}</div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-2 p-3">
              <div />
              <div className="text-center text-[#5B6B7A]">Platform Fee</div>
              <div className="text-right text-[#5B6B7A]">₹{booking.fee}</div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-2 p-3">
              <div />
              <div className="text-center font-semibold text-[#0B1B2B]">Total</div>
              <div className="text-right font-semibold text-[#0B1B2B]">
                ₹{Number(booking.amount) + Number(booking.fee)}
              </div>
            </div>
          </div>
          <div className="text-xs text-[#5B6B7A]">
            Tax/GST integration placeholder. Connect Zoho Books or ClearTax to auto-generate PDFs with GST.
          </div>
        </section>
        <div className="mt-6 print:hidden">
          <Button onClick={printInvoice} className="bg-[#0AA1A7] text-white hover:bg-[#089098]">
            Print / Save PDF
          </Button>
        </div>
      </div>
    </main>
  );
}

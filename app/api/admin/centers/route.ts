import { NextResponse } from "next/server";
import supabase from "../../../../lib/supabaseClient";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Fetch all centers with their related data
    const { data: centers, error: centersError } = await supabase
      .from("centers")
      .select(`
        *,
        partners(*),
        bookings(
          id,
          patient_name,
          patient_email,
          patient_phone,
          status,
          created_at,
          appointment_date,
          services(name, category)
        )
      `)
      .order("name");

    if (centersError) {
      console.error("Supabase centers fetch error:", centersError);
      return NextResponse.json({ error: "Failed to fetch centers" }, { status: 500 });
    }

    // Process centers data to include statistics
    const processedCenters = centers?.map(center => {
      const bookings = center.bookings || [];
      const registeredUsers = new Map();
      
      // Get unique users who have booked at this center
      bookings.forEach((booking: any) => {
        const userKey = booking.patient_email || booking.patient_phone;
        if (userKey && !registeredUsers.has(userKey)) {
          registeredUsers.set(userKey, {
            name: booking.patient_name,
            email: booking.patient_email,
            phone: booking.patient_phone,
            bookingsCount: 1,
            lastBooking: booking.appointment_date
          });
        } else if (userKey) {
          const user = registeredUsers.get(userKey);
          user.bookingsCount += 1;
          if (new Date(booking.appointment_date) > new Date(user.lastBooking)) {
            user.lastBooking = booking.appointment_date;
          }
        }
      });

      return {
        ...center,
        stats: {
          totalBookings: bookings.length,
          registeredUsers: Array.from(registeredUsers.values()),
          registeredUsersCount: registeredUsers.size,
          pendingBookings: bookings.filter((b: any) => b.status === "pending").length,
          completedBookings: bookings.filter((b: any) => b.status === "completed").length,
          cancelledBookings: bookings.filter((b: any) => b.status === "cancelled").length,
          recentBookings: bookings
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        },
       
        bookings: undefined
      };
    }) || [];

    return NextResponse.json({
      centers: processedCenters,
      totalCenters: processedCenters.length,
      activeCenters: processedCenters.filter(c => c.is_active).length,
      totalRegistrations: processedCenters.reduce((sum, c) => sum + c.stats.registeredUsersCount, 0),
      totalBookings: processedCenters.reduce((sum, c) => sum + c.stats.totalBookings, 0)
    });
  } catch (err) {
    console.error("Admin centers fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch admin centers data" }, { status: 500 });
  }
}
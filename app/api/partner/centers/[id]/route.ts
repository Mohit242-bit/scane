import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get specific center details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get partner profile
    const { data: partnerProfile } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    // Get center details with services
    const { data: center, error } = await supabase
      .from("centers")
      .select(`
        *,
        center_services (
          id,
          price,
          special_price,
          is_available,
          services (id, name, category, description, duration_minutes)
        )
      `)
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Center not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ center });
  } catch (error: any) {
    console.error("Get center error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update center details
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get partner profile
    const { data: partnerProfile } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      address,
      city,
      area_hint,
      phone,
      email,
      operating_hours,
      amenities,
      is_active
    } = body;

    // Update center
    const { data: center, error } = await supabase
      .from("centers")
      .update({
        name,
        address,
        city,
        area_hint,
        phone,
        email,
        operating_hours,
        amenities,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      center
    });
  } catch (error: any) {
    console.error("Update center error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deactivate/Delete center
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get partner profile
    const { data: partnerProfile } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!partnerProfile) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    // Check for active bookings
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("center_id", params.id)
      .in("status", ["confirmed", "pending"])
      .limit(1);

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete center with active bookings. Please complete or cancel all bookings first." 
      }, { status: 400 });
    }

    // Soft delete - deactivate center instead of actual deletion
    const { data: center, error } = await supabase
      .from("centers")
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Center deactivated successfully",
      center
    });
  } catch (error: any) {
    console.error("Delete center error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
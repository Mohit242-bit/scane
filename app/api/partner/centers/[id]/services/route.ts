import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get services for specific center
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

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 });
    }

    // Get center services with service details
    const { data: centerServices, error } = await supabase
      .from("center_services")
      .select(`
        *,
        services (
          id,
          name,
          category,
          description,
          duration_minutes,
          preparation_instructions
        )
      `)
      .eq("center_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Also get all available services for adding new ones
    const { data: allServices } = await supabase
      .from("services")
      .select("*")
      .eq("partner_id", partnerProfile.id)
      .order("name");

    return NextResponse.json({
      centerServices: centerServices || [],
      availableServices: allServices || []
    });
  } catch (error: any) {
    console.error("Get center services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add service to center
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const { service_id, price, special_price, is_available = true } = body;

    if (!service_id || !price) {
      return NextResponse.json({ error: "Service ID and price are required" }, { status: 400 });
    }

    // Verify service belongs to partner
    const { data: service } = await supabase
      .from("services")
      .select("id")
      .eq("id", service_id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (!service) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 });
    }

    // Check if service already exists for this center
    const { data: existingService } = await supabase
      .from("center_services")
      .select("id")
      .eq("center_id", params.id)
      .eq("service_id", service_id)
      .single();

    if (existingService) {
      return NextResponse.json({ error: "Service already exists for this center" }, { status: 400 });
    }

    // Add service to center
    const { data: centerService, error } = await supabase
      .from("center_services")
      .insert({
        center_id: parseInt(params.id),
        service_id: service_id,
        price: parseFloat(price),
        special_price: special_price ? parseFloat(special_price) : null,
        is_available
      })
      .select(`
        *,
        services (
          id,
          name,
          category,
          description,
          duration_minutes
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      centerService,
      message: "Service added to center successfully"
    });
  } catch (error: any) {
    console.error("Add center service error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update center service pricing/availability
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const { center_service_id, price, special_price, is_available } = body;

    if (!center_service_id) {
      return NextResponse.json({ error: "Center service ID is required" }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (price !== undefined) updateData.price = parseFloat(price);
    if (special_price !== undefined) updateData.special_price = special_price ? parseFloat(special_price) : null;
    if (is_available !== undefined) updateData.is_available = is_available;

    // Update center service
    const { data: centerService, error } = await supabase
      .from("center_services")
      .update(updateData)
      .eq("id", center_service_id)
      .eq("center_id", params.id)
      .select(`
        *,
        services (
          id,
          name,
          category,
          description,
          duration_minutes
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      centerService,
      message: "Service updated successfully"
    });
  } catch (error: any) {
    console.error("Update center service error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove service from center
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

    // Verify center belongs to partner
    const { data: center } = await supabase
      .from("centers")
      .select("id")
      .eq("id", params.id)
      .eq("partner_id", partnerProfile.id)
      .single();

    if (!center) {
      return NextResponse.json({ error: "Center not found or unauthorized" }, { status: 404 });
    }

    const url = new URL(req.url);
    const center_service_id = url.searchParams.get("center_service_id");

    if (!center_service_id) {
      return NextResponse.json({ error: "Center service ID is required" }, { status: 400 });
    }

    // Check for active bookings with this service
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("center_id", params.id)
      .in("status", ["confirmed", "pending"])
      .limit(1);

    if (activeBookings && activeBookings.length > 0) {
      // Just deactivate instead of deleting
      const { error } = await supabase
        .from("center_services")
        .update({ is_available: false })
        .eq("id", center_service_id)
        .eq("center_id", params.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "Service deactivated successfully (due to active bookings)"
      });
    } else {
      // Delete the center service
      const { error } = await supabase
        .from("center_services")
        .delete()
        .eq("id", center_service_id)
        .eq("center_id", params.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "Service removed from center successfully"
      });
    }
  } catch (error: any) {
    console.error("Delete center service error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
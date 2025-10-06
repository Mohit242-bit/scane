import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get partner's services
export async function GET(req: NextRequest) {
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

    // Get services
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .eq("partner_id", partnerProfile.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ services: services || [] });
  } catch (error: any) {
    console.error("Get services error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new service
export async function POST(req: NextRequest) {
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
      description,
      modality,
      price,
      duration_minutes,
      preparation_instructions
    } = body;

    // Create service
    const { data: service, error } = await supabase
      .from("services")
      .insert({
        partner_id: partnerProfile.id,
        name,
        description,
        modality,
        price: parseFloat(price) || 0,
        duration_minutes: parseInt(duration_minutes) || 30,
        preparation_instructions,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      service
    });
  } catch (error: any) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

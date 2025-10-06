import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-browser";

// GET: Fetch prescriptions (for doctors by center, for users their own)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const centerId = url.searchParams.get("center_id");
    const status = url.searchParams.get("status");

    // Check if user is a doctor
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role === "doctor" || userData?.role === "partner") {
      // Doctor view - fetch prescriptions for their assigned centers
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name
          ),
          center:center_id (
            id,
            name,
            city,
            address
          ),
          recommendations:test_recommendations (
            id,
            recommended_tests,
            doctor_notes,
            total_estimated_cost,
            email_sent,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (centerId) {
        query = query.eq("center_id", parseInt(centerId));
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data: prescriptions, error } = await query;

      if (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
      }

      return NextResponse.json({ prescriptions: prescriptions || [] });
    } else {
      // User view - fetch their own prescriptions
      const { data: prescriptions, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          center:center_id (
            id,
            name,
            city,
            address
          ),
          recommendations:test_recommendations (
            id,
            recommended_tests,
            doctor_notes,
            total_estimated_cost,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
      }

      return NextResponse.json({ prescriptions: prescriptions || [] });
    }
  } catch (error) {
    console.error("Prescriptions fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new prescription upload
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { center_id, patient_name, patient_email, patient_phone, prescription_files, notes } = body;

    // Validate required fields
    if (!patient_name || !patient_email) {
      return NextResponse.json({ error: "Patient name and email are required" }, { status: 400 });
    }

    // Create prescription record
    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert({
        user_id: user.id,
        center_id: center_id ? parseInt(center_id) : null,
        patient_name,
        patient_email,
        patient_phone,
        prescription_files: prescription_files || [],
        notes,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating prescription:", error);
      return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
    }

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    console.error("Prescription creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update prescription status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prescription_id, status, reviewed_by } = body;

    if (!prescription_id) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (reviewed_by) {
      updateData.reviewed_by = reviewed_by;
      updateData.reviewed_at = new Date().toISOString();
    }
    updateData.updated_at = new Date().toISOString();

    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .update(updateData)
      .eq("id", prescription_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating prescription:", error);
      return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error("Prescription update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-browser";

// POST: Create test recommendation for a prescription
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      prescription_id, 
      service_ids, 
      recommended_tests, 
      doctor_notes, 
      total_estimated_cost,
      send_email 
    } = body;

    // Validate required fields
    if (!prescription_id || !recommended_tests || recommended_tests.length === 0) {
      return NextResponse.json({ 
        error: "Prescription ID and recommended tests are required" 
      }, { status: 400 });
    }

    // Create recommendation
    const { data: recommendation, error } = await supabase
      .from("test_recommendations")
      .insert({
        prescription_id,
        doctor_id: user.id,
        service_ids: service_ids || [],
        recommended_tests,
        doctor_notes: doctor_notes || "",
        total_estimated_cost: total_estimated_cost || 0,
        email_sent: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating recommendation:", error);
      return NextResponse.json({ error: "Failed to create recommendation" }, { status: 500 });
    }

    // Update prescription status
    await supabase
      .from("prescriptions")
      .update({ 
        status: "recommended",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", prescription_id);

    // Send email if requested
    if (send_email) {
      try {
        // Get prescription details
        const { data: prescription } = await supabase
          .from("prescriptions")
          .select("patient_name, patient_email")
          .eq("id", prescription_id)
          .single();

        if (prescription) {
          // Import email service
          const { email } = await import("@/lib/email");
          
          // Send email
          await email.sendTestRecommendations(
            prescription.patient_email,
            prescription.patient_name,
            recommended_tests,
            doctor_notes || "",
            total_estimated_cost || 0
          );

          // Mark email as sent
          await supabase
            .from("test_recommendations")
            .update({ email_sent: true })
            .eq("id", recommendation.id);
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ recommendation }, { status: 201 });
  } catch (error) {
    console.error("Test recommendation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch test recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const prescriptionId = url.searchParams.get("prescription_id");

    let query = supabase
      .from("test_recommendations")
      .select(`
        *,
        prescription:prescription_id (
          id,
          patient_name,
          patient_email,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (prescriptionId) {
      query = query.eq("prescription_id", prescriptionId);
    }

    const { data: recommendations, error } = await query;

    if (error) {
      console.error("Error fetching recommendations:", error);
      return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }

    return NextResponse.json({ recommendations: recommendations || [] });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import supabase from "../../../lib/supabaseClient";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const role = url.searchParams.get("role");
    const email = url.searchParams.get("email");

    let query = supabase
      .from("users")
      .select("*");

    if (id) {
      query = query.eq("id", id);
      const { data, error } = await query.single();
      if (error) {
        console.error("Supabase user fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    if (role) {
      query = query.eq("role", role);
    }

    if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase users fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Users fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role || "customer"
      }
    });

    if (authError) {
      console.error("Supabase auth user creation error:", authError);
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    // User profile should be automatically created by the trigger
    // But let's verify and return the profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user?.id)
      .single();

    if (profileError) {
      console.error("Supabase user profile fetch error:", profileError);
      // Fallback: manually create the profile
      const { data: manualProfile, error: manualError } = await supabase
        .from("users")
        .insert([{
          id: authData.user?.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role || "customer"
        }])
        .select()
        .single();

      if (manualError) {
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }

      return NextResponse.json({ 
        user: authData.user,
        profile: manualProfile,
        message: "User created successfully"
      });
    }

    return NextResponse.json({ 
      user: authData.user,
      profile,
      message: "User created successfully"
    });
  } catch (err) {
    console.error("User creation error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase user update error:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("User update error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

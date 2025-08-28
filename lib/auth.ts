import supabase from "./supabaseClient"

export interface User {
  id: string
  email?: string | null
  name?: string | null
  phone?: string | null
  role?: string | null
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get additional user data from database
    const { data: userData } = await supabase
      .from("users")
      .select("id, full_name, phone, role")
      .eq("auth_provider_id", user.id)
      .single()

    return {
      id: user.id,
      email: user.email,
      name: userData?.full_name || user.user_metadata?.name || user.email,
      phone: userData?.phone || user.user_metadata?.phone,
      role: userData?.role || "customer",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`
    }
  })
  
  if (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Sign in with email/password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error("Error signing in with email:", error)
    throw error
  }
  
  return data
}

// Sign up with email/password
export async function signUpWithEmail(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      }
    }
  })
  
  if (error) {
    console.error("Error signing up with email:", error)
    throw error
  }
  
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Check if user has admin role
export async function isAdmin(user: User | null): Promise<boolean> {
  return user?.role === "admin"
}

// Check if user has partner role
export async function isPartner(user: User | null): Promise<boolean> {
  return user?.role === "partner"
}

// Check if user has customer role
export async function isCustomer(user: User | null): Promise<boolean> {
  return user?.role === "customer"
}

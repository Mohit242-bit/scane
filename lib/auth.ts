/**
 * Authentication Service
 * Handles user authentication operations using Supabase Auth
 */

import { createClient } from "./supabase-browser";
import { logger } from "./logger";
import { AuthenticationError } from "./errors";
import type { UserRole } from "./types";

// Create browser client for auth operations
const supabase = createClient();

/**
 * Application user interface
 */
export interface User {
  id: string
  email?: string | null
  name?: string | null
  phone?: string | null
  role?: UserRole | null
}

/**
 * Sign in options
 */
interface SignInOptions {
  email: string
  password: string
}

/**
 * Sign up options
 */
interface SignUpOptions {
  email: string
  password: string
  name?: string
  phone?: string
}

/**
 * Get the currently authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      logger.error("Error getting current user", error);
      return null;
    }

    if (!user) {
      return null;
    }

    // Fetch additional user data from database
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("id, full_name, phone, role")
      .eq("auth_provider_id", user.id)
      .single();

    if (dbError) {
      logger.warn("Error fetching user data from database", {
        error: dbError.message,
        userId: user.id,
      });
    }

    const appUser: User = {
      id: user.id,
      email: user.email,
      name: userData?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || null,
      phone: userData?.phone || user.user_metadata?.phone || null,
      role: (userData?.role as UserRole) || "customer",
    };

    logger.debug("Current user retrieved", { userId: appUser.id, role: appUser.role });

    return appUser;
  } catch (error) {
    logger.error("Unexpected error getting current user", error);
    return null;
  }
}

/**
 * Sign in with Google OAuth
 * @returns Promise that resolves when OAuth flow is initiated
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    logger.info("Initiating Google OAuth sign-in");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    
    if (error) {
      logger.error("Google OAuth sign-in error", error);
      throw new AuthenticationError("Failed to sign in with Google");
    }

    logger.info("Google OAuth flow initiated successfully");
  } catch (error) {
    logger.error("Google sign-in error", error);
    throw error;
  }
}

/**
 * Sign in with email and password
 * @param options - Sign in credentials
 * @returns Authentication data
 */
export async function signInWithEmail(options: SignInOptions) {
  try {
    logger.info("Attempting email/password sign-in", { email: options.email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });
    
    if (error) {
      logger.error("Email sign-in error", error, { email: options.email });
      throw new AuthenticationError("Invalid email or password");
    }

    logger.info("Email sign-in successful", { userId: data.user?.id });
    
    return data;
  } catch (error) {
    logger.error("Sign-in error", error);
    throw error;
  }
}

/**
 * Sign up a new user with email and password
 * @param options - Sign up details
 * @returns Authentication data
 */
export async function signUpWithEmail(options: SignUpOptions) {
  try {
    logger.info("Creating new user account", { email: options.email });

    const { data, error } = await supabase.auth.signUp({
      email: options.email,
      password: options.password,
      options: {
        data: {
          name: options.name || options.email.split("@")[0],
          phone: options.phone,
        },
      },
    });
    
    if (error) {
      logger.error("Sign-up error", error, { email: options.email });
      throw new AuthenticationError("Failed to create account");
    }

    logger.info("User account created successfully", { userId: data.user?.id });
    
    return data;
  } catch (error) {
    logger.error("Sign-up error", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * @returns Promise that resolves when sign-out is complete
 */
export async function signOut(): Promise<void> {
  try {
    logger.info("Signing out user");

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error("Sign-out error", error);
      throw new AuthenticationError("Failed to sign out");
    }

    logger.info("User signed out successfully");
  } catch (error) {
    logger.error("Sign-out error", error);
    throw error;
  }
}

/**
 * Check if user has admin role
 * @param user - User to check
 * @returns true if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

/**
 * Check if user has partner role
 * @param user - User to check
 * @returns true if user is a partner
 */
export function isPartner(user: User | null): boolean {
  return user?.role === "partner";
}

/**
 * Check if user has customer role
 * @param user - User to check
 * @returns true if user is a customer
 */
export function isCustomer(user: User | null): boolean {
  return user?.role === "customer";
}

/**
 * Require authentication - throws if user is not authenticated
 * @param user - User to check
 * @throws AuthenticationError if user is not authenticated
 */
export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new AuthenticationError("Authentication required");
  }
}

/**
 * Require specific role - throws if user doesn't have the role
 * @param user - User to check
 * @param role - Required role
 * @throws AuthenticationError if user doesn't have the required role
 */
export function requireRole(user: User | null, role: UserRole): asserts user is User {
  requireAuth(user);
  
  if (user.role !== role) {
    logger.warn("User lacks required role", { userId: user.id, hasRole: user.role, requiredRole: role });
    throw new AuthenticationError(`${role} access required`);
  }
}


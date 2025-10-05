/**
 * Environment Variables Validation and Type-Safe Access
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod'

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase - Required
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'Supabase URL is required').refine(
    (val) => val.startsWith('http://') || val.startsWith('https://') || val === 'your_supabase_url_here',
    'Supabase URL must be a valid URL'
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Admin - Optional
  ADMIN_MVP_USERNAME: z.string().optional(),
  ADMIN_MVP_PASSWORD: z.string().optional(),
  ADMIN_MVP_SECRET: z.string().optional().refine(
    (val) => !val || val.length >= 32 || val === 'your_long_random_secret_minimum_32_characters',
    'Admin secret must be at least 32 characters'
  ),

  // OAuth - Optional
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_CALLBACK_URL: z.string().optional().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val === 'your_callback_url',
    'OAuth callback URL must be a valid URL if provided'
  ),

  // Payment - Optional
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // Communication - Optional
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // AWS - Optional
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Analytics - Optional
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  MIXPANEL_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val === 'your_sentry_dsn',
    'Sentry DSN must be a valid URL if provided'
  ),

  // External - Optional
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates and returns type-safe environment variables
 * Throws an error if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse({
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

      // Admin
      ADMIN_MVP_USERNAME: process.env.ADMIN_MVP_USERNAME,
      ADMIN_MVP_PASSWORD: process.env.ADMIN_MVP_PASSWORD,
      ADMIN_MVP_SECRET: process.env.ADMIN_MVP_SECRET,

      // OAuth
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_OAUTH_CALLBACK_URL: process.env.GOOGLE_OAUTH_CALLBACK_URL,

      // Payment
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

      // Communication
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      RESEND_API_KEY: process.env.RESEND_API_KEY,

      // AWS
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

      // Analytics
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
      SENTRY_DSN: process.env.SENTRY_DSN,

      // External
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,

      // Node Environment
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      
      // During build, just log a warning instead of throwing
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️  Environment validation warnings during build:\n', missingVars)
        // Return a partial env object with defaults for build time
        return {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
          NODE_ENV: (process.env.NODE_ENV as any) || 'production',
        } as Env
      }
      
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Validate environment variables on module load
export const env = validateEnv()

/**
 * Helper to check if a feature is enabled based on environment variables
 */
export const isFeatureEnabled = {
  payments: () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
  whatsapp: () => Boolean(env.WHATSAPP_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID),
  sms: () => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  email: () => Boolean(env.RESEND_API_KEY),
  storage: () => Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY),
  analytics: () => Boolean(env.GOOGLE_ANALYTICS_ID),
  monitoring: () => Boolean(env.SENTRY_DSN),
} as const

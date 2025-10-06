/**
 * Application Configuration
 * Centralized configuration using validated environment variables
 */

import { env, isFeatureEnabled } from "./env";

export const config = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/scanezy",
    redis: process.env.REDIS_URL || "redis://localhost:6379",
  },
  payment: {
    razorpay: {
      keyId: env.RAZORPAY_KEY_ID || "rzp_test_demo",
      keySecret: env.RAZORPAY_KEY_SECRET || "demo_secret",
    },
  },
  communication: {
    whatsapp: {
      token: env.WHATSAPP_API_TOKEN || "demo_token",
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "demo_id",
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID || "ACdemo_account_sid_placeholder",
      authToken: env.TWILIO_AUTH_TOKEN || "demo_token",
      phoneNumber: env.TWILIO_PHONE_NUMBER || "+1234567890",
    },
    email: {
      resendApiKey: env.RESEND_API_KEY || "demo_key",
      from: process.env.SMTP_FROM || "noreply@scanezy.com",
    },
  },
  storage: {
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || "demo_key",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "demo_secret",
      region: env.AWS_REGION || "ap-south-1",
      bucket: env.AWS_S3_BUCKET || "scanezy-documents",
    },
  },
  analytics: {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    mixpanelToken: env.MIXPANEL_TOKEN,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
  },
  external: {
    googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
  },
  app: {
    name: "ScanEzy",
    url: process.env.NEXTAUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  },
  features: {
    enableAnalytics: isFeatureEnabled.analytics(),
    enablePayments: isFeatureEnabled.payments(),
    enableNotifications: isFeatureEnabled.whatsapp() || isFeatureEnabled.sms() || isFeatureEnabled.email(),
    enableStorage: isFeatureEnabled.storage(),
  },
} as const;

export type AppConfig = typeof config


export const config = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/scanezy",
    redis: process.env.REDIS_URL || "redis://localhost:6379",
  },
  // Auth handled by Supabase Auth - no NextAuth config needed
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "demo_secret",
    },
  },
  communication: {
    whatsapp: {
      token: process.env.WHATSAPP_API_TOKEN || "demo_token",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "demo_id",
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "ACdemo_account_sid_placeholder",
      authToken: process.env.TWILIO_AUTH_TOKEN || "demo_token",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
    },
    email: {
      resendApiKey: process.env.RESEND_API_KEY || "demo_key",
      from: process.env.SMTP_FROM || "noreply@scanezy.com",
    },
  },
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "demo_key",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "demo_secret",
      region: process.env.AWS_REGION || "ap-south-1",
      bucket: process.env.AWS_S3_BUCKET || "scanezy-documents",
    },
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
  },
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
  },
  external: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  app: {
    name: "ScanEzy",
    url: process.env.NEXTAUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  },
  features: {
    enableAnalytics: false,
    enablePayments: false,
    enableNotifications: false,
  },
} as const

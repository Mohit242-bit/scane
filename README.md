# ScanEzy - Modern Radiology Booking Platform

<div align="center">

![ScanEzy Logo](public/placeholder-logo.svg)

**Fast, convenient, and reliable diagnostic services at your fingertips**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ScanEzy is a comprehensive online platform for booking radiology and diagnostic services. It connects patients with certified diagnostic centers, enabling seamless appointment scheduling, online payments, and digital report delivery.

### Key Highlights

- 🏥 **Multi-Center Management** - Support for multiple diagnostic centers
- 📅 **Real-time Slot Booking** - Dynamic availability management
- 💳 **Secure Payments** - Integrated with Razorpay for safe transactions
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔐 **Role-based Access** - Customer, Partner, and Admin roles
- 📊 **Analytics Dashboard** - Business insights for partners
- 🔔 **Notifications** - WhatsApp, SMS, and Email notifications

---

## ✨ Features

### For Customers
- Browse services and centers by location
- Book appointments with instant confirmation
- Upload prescriptions for test recommendations
- Secure online payment processing
- Download reports and invoices
- Track booking history

### For Partners (Diagnostic Centers)
- Multi-center management dashboard
- Service and pricing configuration
- Slot availability management
- Booking and revenue analytics
- Customer management
- Report upload and delivery

### For Admins
- Platform-wide analytics
- Partner approval workflow
- System configuration
- User management
- Content management

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: AWS S3 / Supabase Storage
- **Payments**: Razorpay
- **Email**: Resend
- **SMS**: Twilio
- **WhatsApp**: WhatsApp Business API

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (ready to integrate)
- **Analytics**: Google Analytics (ready to integrate)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scanezy.git
   cd scanezy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see [Environment Variables](#environment-variables))

4. **Run database migrations**
   ```bash
   # Set up Supabase tables using the SQL files in /supabase directory
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
scanezy/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── admin/              # Admin dashboard
│   ├── partner/            # Partner dashboard
│   ├── bookings/           # Booking pages
│   └── ...
├── components/              # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   └── ...
├── lib/                     # Utility libraries
│   ├── api-client.ts       # API client with retry logic
│   ├── auth.ts             # Authentication utilities
│   ├── config.ts           # App configuration
│   ├── constants.ts        # App constants
│   ├── database.ts         # Database operations
│   ├── env.ts              # Environment validation
│   ├── errors.ts           # Error handling
│   ├── logger.ts           # Logging service
│   ├── payment.ts          # Payment service
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   └── ...
├── public/                  # Static assets
├── supabase/               # Supabase SQL files
├── .env.example            # Environment variables template
├── .env.local              # Your environment variables (not in git)
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## 🔐 Environment Variables

Create a `.env.local` file based on `.env.example`:

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Credentials
ADMIN_MVP_USERNAME=your_admin_username
ADMIN_MVP_PASSWORD=your_secure_password
ADMIN_MVP_SECRET=your_secret_key_min_32_chars
```

### Optional Variables

```bash
# Payment
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Communications
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
WHATSAPP_API_TOKEN=your_whatsapp_token

# Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your_bucket_name

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn
```

---

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Quality

This project follows strict TypeScript and ESLint rules:
- Strict type checking enabled
- No unused variables or imports
- Consistent code formatting
- Proper error handling
- Comprehensive logging

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

---

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Razorpay](https://razorpay.com/) - Payment gateway

---

## 📞 Support

For support, email support@scanezy.com or join our Slack channel.

---

<div align="center">
  Made with ❤️ by the ScanEzy Team
</div>

# ScanEzy - Complete Codebase Structure

**Generated**: October 5, 2025  
**Version**: 0.1.0  
**Framework**: Next.js 14 (App Router)

---

## 📁 Root Directory

```
scanezy/
├── 📄 .env                          # Environment variables (ignored by git)
├── 📄 .env.example                  # Environment template for developers
├── 📄 .env.local                    # Local environment overrides (ignored by git)
├── 📄 .gitignore                    # Git ignore configuration
├── 📄 components.json               # shadcn/ui configuration
├── 📄 next.config.mjs              # Next.js configuration (security headers, optimization)
├── 📄 next-env.d.ts                # Next.js TypeScript declarations (auto-generated)
├── 📄 package.json                  # NPM dependencies and scripts
├── 📄 package-lock.json            # NPM dependency lock file
├── 📄 postcss.config.mjs           # PostCSS configuration for Tailwind
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
├── 📄 tsconfig.json                # TypeScript configuration (strict mode enabled)
├── 📄 cypress.config.ts            # ⚠️  Cypress E2E testing config (unused - can remove)
├── 📄 jest.config.js               # ⚠️  Jest testing config (unused - can remove)
├── 📄 jest.setup.js                # ⚠️  Jest setup (unused - can remove)
├── 📄 middleware.ts.backup         # ❌ Backup file (remove)
├── 📄 README.md                     # ✅ Project documentation
├── 📄 OPTIMIZATION_REPORT.md        # ✅ Optimization details and changes
├── 📄 QUICK_START.md                # ✅ Developer quick reference
├── 📄 CLEANUP_REQUIRED.md           # ⚠️  List of files to remove
├── 📄 STRUCTURE.md                  # 📖 This file - complete structure guide
├── 📄 ROADMAP.md                    # Project roadmap
├── 📄 Pseudocode_final.jpg         # ⚠️  Documentation image (move to /docs)
├── 📄 Sequence_customer_journey.jpg # ⚠️  Documentation image (move to /docs)
├── 📂 .next/                        # Next.js build output (auto-generated, ignored)
├── 📂 node_modules/                 # NPM packages (auto-generated, ignored)
├── 📂 .git/                         # Git repository data
├── 📂 .github/                      # GitHub configuration (workflows, etc.)
├── 📂 .vscode/                      # VS Code workspace settings
└── ... (main folders described below)
```

---

## 📂 `/app` - Next.js App Router (Main Application)

**Purpose**: Core application pages and API routes using Next.js 14 App Router

```
app/
├── 📄 layout.tsx                    # ✅ Root layout - wraps all pages, includes Navigation/Footer
├── 📄 page.tsx                      # ✅ Home page - landing page with hero section
├── 📄 globals.css                   # ✅ Global CSS styles and Tailwind imports
│
├── 📂 about/                        # ✅ About page
│   └── page.tsx                     # Company information, mission, team
│
├── 📂 admin/                        # ✅ Admin dashboard (role: admin)
│   ├── layout.tsx                   # Admin layout with AdminGuard
│   ├── page.tsx                     # Admin dashboard home
│   ├── 📂 login/                    # Admin login page
│   │   └── page.tsx
│   └── ... (other admin pages)
│
├── 📂 api/                          # ✅ API Routes (server-side endpoints)
│   ├── 📂 auth/                     # Authentication endpoints
│   │   └── 📂 callback/             # OAuth callback handler
│   │       └── route.ts             # Handles OAuth redirects (Google, etc.)
│   │
│   ├── 📂 bookings/                 # Booking management endpoints
│   │   ├── route.ts                 # GET (list/search), POST (create booking)
│   │   └── 📂 [id]/                 # Dynamic booking routes
│   │       └── route.ts             # GET (get booking), PATCH (update), DELETE
│   │
│   ├── 📂 centers/                  # Diagnostic centers endpoints
│   │   └── route.ts                 # GET centers, filter by location
│   │
│   ├── 📂 contact/                  # Contact form submission
│   │   └── route.ts                 # POST - send contact email
│   │
│   ├── 📂 documents/                # Document management
│   │   ├── route.ts                 # GET documents by booking
│   │   └── 📂 upload/               # Document upload
│   │       └── route.ts             # POST - upload prescription/reports
│   │
│   ├── 📂 otp/                      # OTP (One-Time Password) system
│   │   ├── route.ts                 # POST - send OTP
│   │   └── 📂 verify/               # POST - verify OTP
│   │       └── route.ts
│   │
│   ├── 📂 partner/                  # Partner (diagnostic center) endpoints
│   │   ├── route.ts                 # GET partner profile
│   │   ├── 📂 login/                # Partner login
│   │   │   └── route.ts
│   │   ├── 📂 profile/              # Partner profile management
│   │   │   └── route.ts
│   │   ├── 📂 manual-setup/         # Manual partner setup (admin)
│   │   │   └── route.ts
│   │   ├── 📂 services/             # Partner services management
│   │   │   └── route.ts
│   │   └── 📂 centers/              # Partner centers management
│   │       └── route.ts
│   │
│   ├── 📂 payment/                  # Payment processing
│   │   ├── route.ts                 # POST - verify payment
│   │   └── 📂 create-order/         # POST - create Razorpay order
│   │       └── route.ts
│   │
│   ├── 📂 reviews/                  # Review system
│   │   └── route.ts                 # GET reviews, POST new review
│   │
│   ├── 📂 services/                 # Medical services/tests
│   │   └── route.ts                 # GET all services, filter by category
│   │
│   ├── 📂 services-centers/         # Services and centers combined
│   │   └── route.ts                 # GET services with available centers
│   │
│   └── 📂 slots/                    # Time slot management
│       └── route.ts                 # GET available slots, POST hold slot
│
├── 📂 auth-test/                    # ⚠️  Authentication testing page (remove in production)
│   └── page.tsx
│
├── 📂 book/                         # ✅ Booking flow page
│   └── page.tsx                     # Main booking interface with slot selection
│
├── 📂 bookings/                     # ✅ Bookings management
│   ├── page.tsx                     # User's booking list
│   └── 📂 [id]/                     # Individual booking details
│       └── page.tsx
│
├── 📂 centers/                      # ✅ Diagnostic centers listing
│   └── page.tsx                     # Browse and filter centers
│
├── 📂 check-oauth/                  # ⚠️  OAuth diagnostic page (remove in production)
│   └── page.tsx
│
├── 📂 confirm/                      # ✅ Booking confirmation page
│   └── page.tsx                     # Shows after successful booking
│
├── 📂 contact/                      # ✅ Contact us page
│   └── page.tsx                     # Contact form
│
├── 📂 invoice/                      # ✅ Invoice generation
│   ├── page.tsx                     # Invoice list
│   └── 📂 [id]/                     # Individual invoice
│       └── page.tsx
│
├── 📂 manual-partner-setup/         # ⚠️  Manual partner setup (diagnostic/remove)
│   └── page.tsx
│
├── 📂 oauth-diagnostic/             # ⚠️  OAuth diagnostic (remove in production)
│   └── page.tsx
│
├── 📂 partner/                      # ✅ Partner dashboard area
│   ├── layout.tsx                   # Partner layout with PartnerGuard
│   ├── page.tsx                     # Partner dashboard redirect
│   ├── 📂 login/                    # Partner login page
│   │   └── page.tsx
│   ├── 📂 dashboard/                # Partner dashboard home
│   │   └── page.tsx                 # Analytics, bookings, revenue
│   ├── 📂 onboarding/               # New partner onboarding
│   │   └── page.tsx                 # Multi-step onboarding wizard
│   ├── 📂 details/                  # Partner details form
│   │   └── page.tsx
│   ├── 📂 email-auth/               # Partner email authentication
│   │   └── page.tsx
│   ├── 📂 oauth-test/               # ⚠️  OAuth testing (remove)
│   │   └── page.tsx
│   └── 📂 centers/                  # Partner centers management
│       └── 📂 [id]/                 # Individual center management
│           └── page.tsx
│
├── 📂 partner-us/                   # ✅ Partner registration page
│   └── page.tsx                     # Public partner signup
│
├── 📂 profile/                      # ✅ User profile page
│   └── page.tsx                     # User account settings
│
├── 📂 services/                     # ✅ Services listing page
│   └── page.tsx                     # Browse all medical services/tests
│
├── 📂 support/                      # ✅ Support/FAQ page
│   └── page.tsx                     # Help center, FAQs
│
├── 📂 test-button/                  # ⚠️  Testing page (remove in production)
│   └── page.tsx
│
└── 📂 test-oauth/                   # ⚠️  OAuth testing (remove in production)
    └── page.tsx
```

---

## 📂 `/components` - React Components

**Purpose**: Reusable React components used across the application

```
components/
├── 📄 admin-guard.tsx               # ✅ HOC - Requires admin role to access
├── 📄 admin-navigation.tsx          # ✅ Admin sidebar navigation
├── 📄 auth-guard.tsx                # ✅ HOC - Requires authentication
├── 📄 booking-flow.tsx              # ✅ Main booking component with slot selection
├── 📄 booking-type-selector.tsx     # ✅ Choose booking type (walk-in, home, etc.)
├── 📄 contact-form.tsx              # ✅ Reusable contact form component
├── 📄 dev-tools.tsx                 # ⚠️  Development tools panel (disable in prod)
├── 📄 error-boundary.tsx            # ✅ React error boundary wrapper
├── 📄 footer.tsx                    # ✅ Global footer component
├── 📄 google-analytics.tsx          # ✅ Google Analytics integration component
├── 📄 json-ld.tsx                   # ✅ SEO - Structured data component
├── 📄 link-checker.tsx              # ⚠️  Development link validation (disable in prod)
├── 📄 loading-spinner.tsx           # ✅ Loading state indicator
├── 📄 location-handler.tsx          # ✅ Location detection and selection
├── 📄 location-search-placeholder.tsx # ✅ Location search input
├── 📄 navigation.tsx                # ✅ Global header navigation
├── 📄 onboarding-wizard.tsx         # ✅ Multi-step onboarding component
├── 📄 partner-guard.tsx             # ✅ HOC - Requires partner role
├── 📄 performance-monitor.tsx       # ⚠️  Performance monitoring (dev tool)
├── 📄 prescription-upload.tsx       # ✅ Upload prescription component
├── 📄 razorpay-payment.tsx          # ✅ Razorpay payment integration component
├── 📄 responsive-test.tsx           # ⚠️  Responsive design tester (dev tool)
├── 📄 seo-head.tsx                  # ✅ SEO meta tags component
├── 📄 session-provider.tsx          # ✅ Authentication session provider
├── 📄 theme-provider.tsx            # ✅ Dark/light theme provider
│
└── 📂 ui/                           # ✅ shadcn/ui components (auto-generated)
    ├── accordion.tsx                # Collapsible sections
    ├── alert.tsx                    # Alert/notification boxes
    ├── alert-dialog.tsx             # Modal confirmation dialogs
    ├── aspect-ratio.tsx             # Maintain aspect ratio containers
    ├── avatar.tsx                   # User avatar component
    ├── badge.tsx                    # Small status badges
    ├── button.tsx                   # Button component with variants
    ├── calendar.tsx                 # Date picker calendar
    ├── card.tsx                     # Card container component
    ├── checkbox.tsx                 # Checkbox input
    ├── collapsible.tsx              # Collapsible content
    ├── command.tsx                  # Command palette
    ├── context-menu.tsx             # Right-click context menu
    ├── dialog.tsx                   # Modal dialog
    ├── dropdown-menu.tsx            # Dropdown menu component
    ├── form.tsx                     # Form wrapper with validation
    ├── hover-card.tsx               # Hover popover card
    ├── input.tsx                    # Text input component
    ├── label.tsx                    # Form label component
    ├── menubar.tsx                  # Menu bar component
    ├── navigation-menu.tsx          # Navigation menu
    ├── popover.tsx                  # Popover component
    ├── progress.tsx                 # Progress bar
    ├── radio-group.tsx              # Radio button group
    ├── scroll-area.tsx              # Custom scrollable area
    ├── select.tsx                   # Select dropdown
    ├── separator.tsx                # Visual separator line
    ├── sheet.tsx                    # Slide-out sheet/drawer
    ├── skeleton.tsx                 # Loading skeleton
    ├── slider.tsx                   # Range slider
    ├── switch.tsx                   # Toggle switch
    ├── table.tsx                    # Data table
    ├── tabs.tsx                     # Tabbed interface
    ├── textarea.tsx                 # Multi-line text input
    ├── toast.tsx                    # Toast notifications
    ├── toaster.tsx                  # Toast container
    └── tooltip.tsx                  # Tooltip component
```

---

## 📂 `/lib` - Core Business Logic & Utilities

**Purpose**: Core business logic, utilities, and service integrations (OPTIMIZED)

```
lib/
├── 📄 analytics.ts                  # ✅ Google Analytics tracking functions
├── 📄 api-client.ts                 # ✅ NEW - HTTP client with retry logic
├── 📄 auth.ts                       # ✅ OPTIMIZED - Authentication functions (Supabase)
├── 📄 config.ts                     # ✅ OPTIMIZED - App configuration management
├── 📄 constants.ts                  # ✅ NEW - Application constants (no magic strings)
├── 📄 data.ts                       # ✅ Mock data and seed data for development
├── 📄 database.ts                   # ⚠️  Legacy database operations (consolidate with db.ts)
├── 📄 db.ts                         # ⚠️  Database operations (consolidate with database.ts)
├── 📄 email.ts                      # ✅ Email sending functions (Resend)
├── 📄 env.ts                        # ✅ NEW - Environment variable validation (Zod)
├── 📄 errors.ts                     # ✅ NEW - Custom error classes & handling
├── 📄 events.ts                     # ✅ Event tracking functions
├── 📄 ics.ts                        # ✅ ICS calendar file generation
├── 📄 logger.ts                     # ✅ NEW - Structured logging service
├── 📄 notifications.ts              # ✅ Notification management (email/SMS/WhatsApp)
├── 📄 payment.ts                    # ✅ OPTIMIZED - Razorpay payment service
├── 📄 rate-limit.ts                 # ✅ API rate limiting
├── 📄 slot-engine.ts                # ✅ Slot availability calculation engine
├── 📄 sms.ts                        # ✅ SMS sending (Twilio)
├── 📄 storage.ts                    # ✅ File storage (AWS S3)
├── 📄 supabaseClient.ts             # ✅ OPTIMIZED - Supabase client singleton
├── 📄 types.ts                      # ✅ OPTIMIZED - TypeScript type definitions
├── 📄 utils.ts                      # ✅ OPTIMIZED - Utility functions
├── 📄 validation.ts                 # ✅ Form validation schemas (Zod)
├── 📄 whatsapp-templates.ts         # ✅ WhatsApp message templates
├── 📄 whatsapp.ts                   # ✅ WhatsApp API integration
│
└── 📂 generated/                    # ⚠️  Auto-generated files (Prisma - unused, remove)
    └── prisma/                      # ❌ Prisma client (not used, remove)
```

---

## 📂 `/hooks` - Custom React Hooks

**Purpose**: Reusable React hooks

```
hooks/
├── 📄 use-mobile.tsx                # ✅ Detect mobile screen size
└── 📄 use-toast.ts                  # ✅ Toast notification hook
```

---

## 📂 `/public` - Static Assets

**Purpose**: Publicly accessible static files (images, fonts, etc.)

```
public/
├── 📄 placeholder-logo.png          # ✅ Placeholder brand logo (PNG)
├── 📄 placeholder-logo.svg          # ✅ Placeholder brand logo (SVG)
├── 📄 placeholder-user.jpg          # ✅ Default user avatar
├── 📄 placeholder.jpg               # ✅ General placeholder image
├── 📄 placeholder.svg               # ✅ General placeholder SVG
├── 📄 radiology-reception.png       # ✅ Hero section image
│
└── 📂 brand/                        # ✅ Brand assets
    └── (logo variants, favicons, etc.)
```

---

## 📂 `/styles` - Global Styles

**Purpose**: Global CSS files

```
styles/
└── 📄 globals.css                   # ⚠️  Duplicate of app/globals.css (consolidate)
```

---

## 📂 `/supabase` - Database Scripts

**Purpose**: Supabase database SQL scripts

```
supabase/
├── 📄 01-drop-tables.sql            # ✅ Drop all tables (reset script)
├── 📄 02-create-tables.sql          # ✅ Create all database tables
├── 📄 policies.sql                  # ✅ Row Level Security policies
└── 📄 seed.sql                      # ✅ Seed initial data
```

---

## 📂 `/prisma` - Prisma (UNUSED)

**Purpose**: ❌ Legacy Prisma ORM files - NOT USED (Remove)

```
prisma/
├── 📂 migrations/                   # ❌ Database migrations (not used)
├── 📄 schema.prisma                 # ❌ Prisma schema (not used)
├── 📄 seed.js                       # ❌ Seed script (not used)
└── 📄 seed.ts                       # ❌ Seed script (not used)
```

**Action**: Remove entire folder - project uses Supabase, not Prisma

---

## 📂 `/scripts` - Utility Scripts

**Purpose**: Development and maintenance scripts

```
scripts/
├── 📄 check-db.js                   # ❌ Database checker (unused, remove)
├── 📄 create-schema.js              # ❌ Schema creation (unused, remove)
├── 📄 init-database.js              # ❌ Database init (unused, remove)
├── 📄 init-users-table.sql          # ⚠️  Move to /supabase folder
├── 📄 seed-client.ts                # ❌ Seed script (unused, remove)
├── 📄 seed-data.js                  # ❌ Seed script (unused, remove)
├── 📄 seed-production-ready.js      # ❌ Seed script (unused, remove)
├── 📄 seed-simple.js                # ❌ Seed script (unused, remove)
├── 📄 seed.js                       # ❌ Seed script (unused, remove)
├── 📄 seed.ts                       # ❌ Seed script (unused, remove)
├── 📄 setup-whatsapp-templates.js   # ⚠️  Keep if using WhatsApp, else remove
└── 📄 test-partner-auth.js          # ❌ Test file (remove)
```

---

## 📂 `/tests` & `/__tests__` - Testing (INCOMPLETE)

**Purpose**: Test files (currently incomplete)

```
tests/
└── 📄 partner-auth-flow.spec.ts     # ⚠️  Incomplete test

__tests__/
├── 📂 components/                   # ⚠️  Incomplete component tests
├── 📂 pages/                        # ⚠️  Incomplete page tests
└── 📄 partner-auth-flow.test.ts     # ⚠️  Incomplete test

cypress/                             # ⚠️  E2E test framework (incomplete)
├── 📂 e2e/                          # E2E test specs
└── 📂 support/                      # Cypress support files
```

**Action**: Remove if not using, or complete comprehensive test suite

---

## 📊 Statistics

### File Count
- **Total Files**: ~200+
- **Core Application Files**: ~150
- **Test Files**: ~20 (incomplete)
- **Configuration Files**: ~15
- **Documentation Files**: ~8
- **Legacy/Unused Files**: ~30

### Lines of Code (Approximate)
- **TypeScript/TSX**: ~15,000 lines
- **CSS**: ~500 lines
- **Configuration**: ~1,000 lines
- **Documentation**: ~3,000 lines
- **Total**: ~19,500 lines

### Dependencies
- **Production Dependencies**: 70+
- **Development Dependencies**: 10+
- **Unused Dependencies**: ~10 (see CLEANUP_REQUIRED.md)

---

## 🎯 Key Files Summary

### Must Keep (Core)
```
✅ app/layout.tsx                    - Root layout
✅ app/page.tsx                      - Home page
✅ components/navigation.tsx         - Global navigation
✅ lib/auth.ts                       - Authentication
✅ lib/payment.ts                    - Payment processing
✅ lib/supabaseClient.ts             - Database client
✅ lib/logger.ts                     - Logging (NEW)
✅ lib/errors.ts                     - Error handling (NEW)
✅ lib/env.ts                        - Environment validation (NEW)
✅ next.config.mjs                   - Next.js config
✅ package.json                      - Dependencies
```

### Can Remove (Unused)
```
❌ prisma/ (entire folder)           - Not using Prisma
❌ scripts/ (most files)             - Legacy scripts
❌ tests/ & __tests__/               - Incomplete tests
❌ middleware.ts.backup              - Backup file
❌ cypress.config.ts                 - Unused testing
❌ jest.config.js                    - Unused testing
```

### Review & Decide
```
⚠️  app/test-*/ folders              - Test pages (remove in prod)
⚠️  app/oauth-diagnostic/            - Diagnostic pages (remove in prod)
⚠️  components/dev-tools.tsx         - Dev tools (disable in prod)
⚠️  components/performance-monitor.tsx - Dev tool (disable in prod)
```

---

## 📚 Related Documentation

- **README.md** - Project overview and setup
- **OPTIMIZATION_REPORT.md** - Detailed optimization changes
- **QUICK_START.md** - Developer quick reference
- **CLEANUP_REQUIRED.md** - Files to remove
- **ROADMAP.md** - Project roadmap

---

**Last Updated**: October 5, 2025  
**Maintained By**: Development Team

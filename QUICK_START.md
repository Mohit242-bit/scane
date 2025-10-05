# ScanEzy Quick Start Guide

A quick reference guide for developers working on ScanEzy.

---

## 🚀 Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📁 Project Structure (Quick Reference)

```
lib/
├── api-client.ts      # HTTP client with retry
├── auth.ts            # Authentication functions
├── config.ts          # App configuration
├── constants.ts       # App constants
├── database.ts        # Database operations
├── env.ts             # Environment validation
├── errors.ts          # Error classes
├── logger.ts          # Logging service
├── payment.ts         # Payment operations
├── types.ts           # TypeScript types
└── utils.ts           # Utility functions

app/
├── api/              # API routes
├── admin/           # Admin dashboard
├── partner/         # Partner dashboard
└── (pages)/         # Public pages

components/
├── ui/              # shadcn/ui components
└── (features)/      # Feature components
```

---

## 🔧 Common Tasks

### Add a New API Route

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'
import { asyncHandler } from '@/lib/errors'
import { logger } from '@/lib/logger'

export const POST = asyncHandler(async (request: Request) => {
  logger.info('Processing example request')
  
  const data = await request.json()
  
  // Your logic here
  
  return NextResponse.json({ success: true, data })
})
```

### Use the Logger

```typescript
import { logger } from '@/lib/logger'

// Info logging
logger.info('User logged in', { userId, email })

// Error logging
logger.error('Failed to process payment', error, { bookingId, amount })

// Debug logging (only in development)
logger.debug('Processing step 1', { step: 1, data })

// Warning
logger.warn('Rate limit approaching', { requests, limit })
```

### Handle Errors

```typescript
import { NotFoundError, ValidationError } from '@/lib/errors'

// Throw typed errors
throw new NotFoundError('Booking')
throw new ValidationError('Invalid input', { email: 'Invalid format' })

// In API routes - asyncHandler catches errors automatically
export const GET = asyncHandler(async (request) => {
  const booking = await getBooking(id)
  if (!booking) {
    throw new NotFoundError('Booking')
  }
  return NextResponse.json(booking)
})
```

### Use Constants

```typescript
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '@/lib/constants'

// Instead of strings
if (booking.status === BOOKING_STATUS.PENDING) {...}
if (user.role === ROLES.ADMIN) {...}
```

### Access Environment Variables

```typescript
import { env, isFeatureEnabled } from '@/lib/env'

// Type-safe access
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL

// Check if feature is enabled
if (isFeatureEnabled.payments()) {
  // Process payment
}
```

### Make API Calls (Client-side)

```typescript
import { apiClient } from '@/lib/api-client'
import type { Booking } from '@/lib/types'

// GET request
const bookings = await apiClient.get<Booking[]>('/api/bookings')

// POST request
const booking = await apiClient.post<Booking>('/api/bookings', {
  serviceId,
  centerId,
  // ...
})

// Automatic retries, error handling, and logging included
```

### Use Authentication

```typescript
import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

// Get current user
const user = await getCurrentUser()

// Require authentication (throws if not authenticated)
requireAuth(user)

// Require specific role (throws if wrong role)
requireRole(user, ROLES.ADMIN)
```

### Format Data

```typescript
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

// Format currency
formatCurrency(1500) // "₹1,500"

// Format date
formatDate(new Date()) // "5 October 2025"

// Format time
formatTime('14:30') // "2:30 PM"
```

---

## 🎨 UI Components

### Use shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

<Button variant="default" size="lg">
  Book Now
</Button>

<Card>
  <CardHeader>
    <CardTitle>Booking Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## 🐛 Debugging

### Check Logs

```bash
# Development - logs appear in terminal
npm run dev

# Look for [INFO], [ERROR], [WARN] prefixes
```

### Check Environment

```typescript
import { env } from '@/lib/env'

// Environment validation happens on startup
// If config is wrong, app won't start
// Check error message for details
```

### Common Issues

1. **"Environment validation failed"**
   - Check `.env.local` file
   - Compare with `.env.example`
   - Ensure all required variables are set

2. **TypeScript errors**
   - Run `npm run type-check`
   - Fix type errors before committing

3. **Import errors**
   - Use `@/` prefix for absolute imports
   - Example: `import { logger } from '@/lib/logger'`

---

## 📝 Code Style

### TypeScript

```typescript
// ✅ Good - Explicit types
export function processBooking(data: BookingData): Promise<Booking> {
  return apiClient.post<Booking>('/api/bookings', data)
}

// ❌ Bad - Any types
export function processBooking(data: any): Promise<any> {
  return apiClient.post('/api/bookings', data)
}
```

### Logging

```typescript
// ✅ Good - Structured logging
logger.info('Booking created', { bookingId, userId, amount })

// ❌ Bad - Console.log
console.log('Booking created:', bookingId, userId, amount)
```

### Error Handling

```typescript
// ✅ Good - Typed errors
throw new NotFoundError('Booking')

// ❌ Bad - Generic errors
throw new Error('Booking not found')
```

### Constants

```typescript
// ✅ Good - Use constants
import { BOOKING_STATUS } from '@/lib/constants'
if (status === BOOKING_STATUS.CONFIRMED) {...}

// ❌ Bad - Magic strings
if (status === 'confirmed') {...}
```

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

---

## 📦 Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
git push origin main
# Vercel auto-deploys from main branch
```

---

## 🆘 Need Help?

- **Documentation**: Check `README.md`
- **Optimization Report**: Check `OPTIMIZATION_REPORT.md`
- **Type Definitions**: Check `lib/types.ts`
- **Examples**: Look at existing API routes and components

---

## ✅ Checklist Before Committing

- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] No `console.log` statements (use `logger` instead)
- [ ] No `any` types (use proper types)
- [ ] No hardcoded strings (use constants)
- [ ] Added JSDoc comments for new functions
- [ ] Tested locally
- [ ] Updated documentation if needed

---

**Happy Coding! 🚀**

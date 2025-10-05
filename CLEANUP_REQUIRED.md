# Cleanup Required - Unused Files and Dependencies

**Generated**: October 5, 2025  
**Status**: ⚠️ Action Required

---

## 🗑️ Files and Folders to Remove

### 1. Prisma (NOT USED - Using Supabase)

**Status**: ❌ Remove Completely

**Folders:**
```bash
prisma/                    # Entire Prisma folder - NOT USED
├── migrations/           # Database migrations (legacy)
├── schema.prisma        # Prisma schema (legacy)
├── seed.js              # Seed scripts (legacy)
└── seed.ts              # Seed scripts (legacy)
```

**Action Required:**
```bash
# Remove Prisma folder
rm -rf prisma/

# Remove Prisma from .gitignore references
# Edit .gitignore and remove:
# - /lib/generated/prisma
# - prisma/
```

**Reason**: Project uses Supabase for database, not Prisma. All database operations use Supabase client.

---

### 2. Legacy Scripts (MOSTLY UNUSED)

**Status**: ❌ Remove or Consolidate

**Files:**
```bash
scripts/
├── check-db.js                    # ❌ Remove - unused
├── create-schema.js               # ❌ Remove - schema in Supabase
├── init-database.js               # ❌ Remove - Supabase handles init
├── init-users-table.sql          # ⚠️  Move to /supabase folder
├── seed-client.ts                # ❌ Remove - unused
├── seed-data.js                  # ❌ Remove - unused
├── seed-production-ready.js      # ❌ Remove - unused
├── seed-simple.js                # ❌ Remove - unused
├── seed.js                       # ❌ Remove - unused
├── seed.ts                       # ❌ Remove - unused
├── setup-whatsapp-templates.js   # ⚠️  Keep if using WhatsApp
└── test-partner-auth.js          # ❌ Remove - test file
```

**Action Required:**
```bash
# Remove unused scripts
rm scripts/check-db.js
rm scripts/create-schema.js
rm scripts/init-database.js
rm scripts/seed*.js
rm scripts/seed*.ts
rm scripts/test-partner-auth.js

# Move SQL to supabase folder
mv scripts/init-users-table.sql supabase/

# Keep only if using WhatsApp
# Otherwise remove: scripts/setup-whatsapp-templates.js
```

---

### 3. Test Files (INCOMPLETE)

**Status**: ⚠️ Remove or Complete

**Files:**
```bash
tests/
└── partner-auth-flow.spec.ts     # ⚠️  Incomplete test

__tests__/
├── components/                   # ⚠️  Incomplete tests
├── pages/                        # ⚠️  Incomplete tests
└── partner-auth-flow.test.ts     # ⚠️  Incomplete test

cypress/                          # ⚠️  Cypress E2E tests
├── e2e/
└── support/

jest.config.js                    # Jest configuration
jest.setup.js                     # Jest setup
cypress.config.ts                 # Cypress configuration
```

**Action Required:**

**Option 1: Remove (Recommended for now)**
```bash
rm -rf tests/
rm -rf __tests__/
rm -rf cypress/
rm jest.config.js
rm jest.setup.js
rm cypress.config.ts
```

**Option 2: Keep and Complete**
- Complete the test suite
- Add proper test coverage
- Set up CI/CD for automated testing

**Reason**: Tests are incomplete and not running. Better to remove and add comprehensive tests later.

---

### 4. Backup and Temporary Files

**Status**: ❌ Remove

**Files:**
```bash
middleware.ts.backup              # ❌ Remove - backup file
.env.local.backup                # ❌ Remove - backup file
.env.local.example               # ❌ Remove - duplicate of .env.example
```

**Action Required:**
```bash
rm middleware.ts.backup
rm .env.local.backup
rm .env.local.example
```

---

### 5. Documentation Images

**Status**: ⚠️ Review

**Files:**
```bash
Pseudocode_final.jpg             # ⚠️  Move to /docs folder
Sequence_customer_journey.jpg    # ⚠️  Move to /docs folder
```

**Action Required:**
```bash
# Create docs folder
mkdir docs

# Move documentation images
mv Pseudocode_final.jpg docs/
mv Sequence_customer_journey.jpg docs/
```

---

## 📦 Dependencies to Remove

### Unused NPM Packages

**Status**: ❌ Remove from package.json

```json
{
  "@auth/core": "latest",           // ❌ NOT USED - Using Supabase Auth
  "mocha": "latest",                // ❌ NOT USED - Using Jest (if keeping tests)
  "node-notifier": "latest",        // ❌ NOT USED - Desktop notifications
  "uuid": "latest",                 // ❌ NOT USED - Using custom generateId()
  "crypto": "latest",               // ⚠️  Built-in Node.js module, don't need to install
  "jest": "latest",                 // ❌ Remove if removing tests
  "cypress": "latest",              // ❌ Remove if removing tests
  "@testing-library/dom": "latest", // ❌ Remove if removing tests
  "@testing-library/jest-dom": "latest", // ❌ Remove if removing tests
  "@testing-library/react": "latest"     // ❌ Remove if removing tests
}
```

**Action Required:**
```bash
# Remove unused dependencies
npm uninstall @auth/core mocha node-notifier uuid crypto

# If removing tests, also remove:
npm uninstall jest cypress @testing-library/dom @testing-library/jest-dom @testing-library/react
```

---

## 🔍 Dependencies to Review

### Potentially Unused or Redundant

```json
{
  "dotenv": "^17.2.1",              // ⚠️  Next.js loads .env automatically
  "nodemailer": "latest",           // ⚠️  Using Resend instead?
  "embla-carousel-react": "latest", // ⚠️  Check if used in components
  "cmdk": "latest",                 // ⚠️  Command palette - check if used
  "input-otp": "latest",            // ⚠️  OTP input - check if used
  "recharts": "latest",             // ⚠️  Charts library - check if used
  "vaul": "latest",                 // ⚠️  Drawer component - check if used
  "react-resizable-panels": "latest" // ⚠️  Resizable panels - check if used
}
```

**Action Required:**
Search codebase for usage of each library. If not used, remove.

---

## 📋 Cleanup Commands Summary

### Safe to Remove Now

```bash
# Navigate to project
cd "c:\Users\mohit\Desktop\visual studio\web dev\Scanezy"

# Remove Prisma
Remove-Item -Recurse -Force prisma

# Remove legacy scripts
Remove-Item scripts/check-db.js
Remove-Item scripts/create-schema.js
Remove-Item scripts/init-database.js
Remove-Item scripts/seed-client.ts
Remove-Item scripts/seed-data.js
Remove-Item scripts/seed-production-ready.js
Remove-Item scripts/seed-simple.js
Remove-Item scripts/seed.js
Remove-Item scripts/seed.ts
Remove-Item scripts/test-partner-auth.js

# Remove test files (if not using)
Remove-Item -Recurse -Force tests
Remove-Item -Recurse -Force __tests__
Remove-Item -Recurse -Force cypress
Remove-Item jest.config.js
Remove-Item jest.setup.js
Remove-Item cypress.config.ts

# Remove backup files
Remove-Item middleware.ts.backup
Remove-Item .env.local.backup
Remove-Item .env.local.example

# Create docs folder and move images
New-Item -ItemType Directory -Force -Path docs
Move-Item Pseudocode_final.jpg docs/
Move-Item Sequence_customer_journey.jpg docs/

# Move SQL file
Move-Item scripts/init-users-table.sql supabase/

# Remove unused npm packages
npm uninstall @auth/core mocha node-notifier uuid crypto jest cypress @testing-library/dom @testing-library/jest-dom @testing-library/react dotenv
```

---

## ✅ After Cleanup Checklist

- [ ] Removed Prisma folder
- [ ] Removed legacy script files
- [ ] Removed test files (or kept and completed)
- [ ] Removed backup files
- [ ] Moved documentation to /docs
- [ ] Removed unused npm packages
- [ ] Updated .gitignore (removed Prisma references)
- [ ] Tested application still works
- [ ] Ran `npm install` to update package-lock.json
- [ ] Committed changes with clear message

---

## 💾 Estimated Space Saved

- **Prisma folder**: ~500 KB
- **Scripts folder**: ~100 KB
- **Test folders**: ~50 KB
- **node_modules** (after removing packages): ~50-100 MB
- **Total**: ~50-100 MB

---

## ⚠️ Warning

**Before removing anything:**
1. ✅ Commit current working code
2. ✅ Create a backup branch
3. ✅ Test thoroughly after cleanup
4. ✅ Verify all features still work

```bash
# Create backup branch
git checkout -b backup-before-cleanup
git add .
git commit -m "Backup before cleanup"

# Switch back to main
git checkout main

# Perform cleanup
# ... cleanup commands ...

# Test application
npm run dev

# If everything works, commit
git add .
git commit -m "Clean up unused files and dependencies"
```

---

**Status**: Ready for cleanup - Review and execute commands above

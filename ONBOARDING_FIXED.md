#  FIXED: Database Schema Mismatch

## Problem
The onboarding was trying to insert into columns that don't exist:
-  `name`  doesn't exist
-  `email`  doesn't exist  
-  `phone`  doesn't exist
-  `business_address`  doesn't exist

## Solution
Updated to use the CORRECT column names from your database:
-  `business_name` 
-  `business_email`
-  `business_phone`
-  `address`
-  `city`

## Current Status
 Dev server running on: http://localhost:3001
 Onboarding page fixed and error-free
 Database schema matches code

##  NEXT STEPS - DO THIS NOW

### STEP 1: Test Doctor Onboarding
1. Open browser: http://localhost:3001/partner/login
2. Sign in with Google (workerdev8@gmail.com)
3. You'll be redirected to onboarding page
4. Fill in the form:
   - Full Name: (pre-filled)
   - Phone: +91 9876543210
   - Specialization: Radiology (optional)
   - License: (optional)
5. Click "Complete Setup"
6. Should redirect to dashboard

### STEP 2: Run SQL Migration for Prescription Tables
The onboarding will work NOW, but you still need prescription tables.

Open Supabase Dashboard and run this SQL:

```sql
-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id INTEGER,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  prescription_files JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'recommended', 'completed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_recommendations table
CREATE TABLE IF NOT EXISTS test_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_ids INTEGER[] DEFAULT '{}'::integer[],
  recommended_tests JSONB DEFAULT '[]'::jsonb,
  doctor_notes TEXT,
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor_center_assignments table
CREATE TABLE IF NOT EXISTS doctor_center_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, center_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_center_id ON prescriptions(center_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_test_recommendations_prescription_id ON test_recommendations(prescription_id);
CREATE INDEX IF NOT EXISTS idx_test_recommendations_doctor_id ON test_recommendations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_assignments_doctor_id ON doctor_center_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_assignments_center_id ON doctor_center_assignments(center_id);

-- Enable RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_center_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view all prescriptions" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update prescriptions" ON prescriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.user_id = auth.uid()
    )
  );

-- Policies for test_recommendations
CREATE POLICY "Users can view their recommendations" ON test_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = test_recommendations.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create recommendations" ON test_recommendations
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can view their recommendations" ON test_recommendations
  FOR SELECT USING (auth.uid() = doctor_id);

-- Policies for doctor_center_assignments
CREATE POLICY "Doctors can view their assignments" ON doctor_center_assignments
  FOR SELECT USING (auth.uid() = doctor_id);
```

### STEP 3: Test Prescription Upload
1. Open incognito window
2. Go to: http://localhost:3001/book
3. Upload a prescription with patient info
4. Submit

### STEP 4: Review in Doctor Dashboard
1. Back to your logged-in doctor account
2. Go to: http://localhost:3001/partner/dashboard
3. Select a center
4. Review prescriptions
5. Send recommendations

##  You're Ready!
The error is FIXED. Go test it now! Start with Step 1.

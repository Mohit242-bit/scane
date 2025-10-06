-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id INTEGER REFERENCES centers(id) ON DELETE SET NULL,
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
  center_id INTEGER REFERENCES centers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, center_id)
);

-- Add indexes for better performance
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

CREATE POLICY "Doctors can view prescriptions for their centers" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctor_center_assignments
      WHERE doctor_id = auth.uid() AND center_id = prescriptions.center_id
    )
  );

CREATE POLICY "Doctors can update prescriptions for their centers" ON prescriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM doctor_center_assignments
      WHERE doctor_id = auth.uid() AND center_id = prescriptions.center_id
    )
  );

-- Policies for test_recommendations
CREATE POLICY "Users can view their own recommendations" ON test_recommendations
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

CREATE POLICY "Admins can manage assignments" ON doctor_center_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

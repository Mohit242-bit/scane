-- Complete Supabase schema for ScanEzy
-- Run this in the Supabase SQL editor (SQL -> New query) to create all tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'partner')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Partners table
CREATE TABLE IF NOT EXISTS partners (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NULL,
  business_name text NOT NULL,
  business_email text,
  business_phone text,
  address text,
  city text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Services table
CREATE TABLE IF NOT EXISTS services (
  id serial PRIMARY KEY,
  partner_id integer REFERENCES partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  modality text,
  price numeric DEFAULT 0,
  duration_minutes integer DEFAULT 30,
  preparation_instructions text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Centers table
CREATE TABLE IF NOT EXISTS centers (
  id serial PRIMARY KEY,
  partner_id integer REFERENCES partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  area_hint text,
  rating numeric DEFAULT 4.5,
  phone text,
  email text,
  operating_hours jsonb,
  amenities text[],
  is_active boolean DEFAULT true,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) Slots table
CREATE TABLE IF NOT EXISTS slots (
  id serial PRIMARY KEY,
  center_id integer REFERENCES centers(id) ON DELETE CASCADE,
  service_id integer REFERENCES services(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  price numeric NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'maintenance')),
  tat_hours integer DEFAULT 24,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6) Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  service_id integer REFERENCES services(id) ON DELETE SET NULL,
  center_id integer REFERENCES centers(id) ON DELETE SET NULL,
  slot_id integer REFERENCES slots(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text NOT NULL,
  patient_age integer,
  patient_gender text,
  appointment_date timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id text,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7) Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id serial PRIMARY KEY,
  booking_id integer REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  center_id integer REFERENCES centers(id) ON DELETE CASCADE,
  service_id integer REFERENCES services(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 8) Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 9) Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- ----------------------
-- Sample data: partners
-- ----------------------
INSERT INTO partners (business_name, business_email, business_phone, address, city, status)
VALUES
  ('MedCare Diagnostics', 'admin@medcare.com', '+91-9876543210', '123 Healthcare Street, Bandra West', 'Mumbai', 'approved'),
  ('City Scan Centers', 'contact@cityscan.com', '+91-9876543211', '456 Diagnostic Avenue, Andheri East', 'Mumbai', 'approved'),
  ('Pune Medical Hub', 'info@punemedical.com', '+91-9876543212', '789 Medical Plaza, Deccan', 'Pune', 'approved')
ON CONFLICT DO NOTHING;

-- ----------------------
-- Sample data: services
-- ----------------------
INSERT INTO services (partner_id, name, description, modality, price, duration_minutes, preparation_instructions)
VALUES
  (1, 'MRI Brain', 'Magnetic resonance imaging of the brain for detailed neurological assessment', 'MRI', 2500, 45, 'Remove all metal objects. Arrive 30 minutes early.'),
  (1, 'X-Ray Chest', 'Chest radiograph for lung and heart examination', 'XRAY', 300, 15, 'Wear loose clothing without metal buttons.'),
  (2, 'CT Head', 'CT scan of the head for detailed brain imaging', 'CT', 1800, 30, 'No special preparation required.'),
  (2, 'Ultrasound Abdomen', 'Abdominal ultrasound for organ examination', 'USG', 800, 30, 'Fast for 8 hours before the scan.'),
  (3, 'MRI Spine', 'MRI of the spine for detailed spinal cord imaging', 'MRI', 3000, 60, 'Remove all metal objects. Inform about any implants.')
ON CONFLICT DO NOTHING;

-- ----------------------
-- Sample data: centers
-- ----------------------
INSERT INTO centers (partner_id, name, address, city, area_hint, rating, phone, email, operating_hours)
VALUES
  (1, 'MedCare Bandra Center', '123 Healthcare Street, Bandra West, Mumbai 400050', 'Mumbai', 'Bandra West', 4.6, '+91-9876543210', 'bandra@medcare.com', '{"mon-fri": "8:00-20:00", "sat": "8:00-18:00", "sun": "10:00-16:00"}'),
  (2, 'City Scan Andheri', '456 Diagnostic Avenue, Andheri East, Mumbai 400069', 'Mumbai', 'Andheri East', 4.4, '+91-9876543211', 'andheri@cityscan.com', '{"mon-sat": "7:00-21:00", "sun": "9:00-17:00"}'),
  (3, 'Pune Medical Deccan', '789 Medical Plaza, Deccan Gymkhana, Pune 411004', 'Pune', 'Deccan', 4.7, '+91-9876543212', 'deccan@punemedical.com', '{"mon-fri": "8:00-19:00", "sat": "8:00-17:00", "sun": "closed"}')
ON CONFLICT DO NOTHING;

-- ----------------------
-- Sample data: slots
-- ----------------------
INSERT INTO slots (center_id, service_id, start_time, end_time, price, status, tat_hours)
VALUES
  (1, 1, now() + interval '1 day', now() + interval '1 day 45 minutes', 2500, 'available', 24),
  (1, 2, now() + interval '1 day 2 hours', now() + interval '1 day 2 hours 15 minutes', 300, 'available', 2),
  (2, 3, now() + interval '2 days', now() + interval '2 days 30 minutes', 1800, 'available', 6),
  (2, 4, now() + interval '2 days 3 hours', now() + interval '2 days 3 hours 30 minutes', 800, 'available', 4),
  (3, 5, now() + interval '3 days', now() + interval '3 days 1 hour', 3000, 'available', 48)
ON CONFLICT DO NOTHING;

-- ----------------------
-- Example booking (optional)
-- ----------------------
INSERT INTO bookings (service_id, center_id, slot_id, patient_name, patient_email, patient_phone, appointment_date, total_amount)
VALUES
  (1, 1, 1, 'Test Patient', 'test@example.com', '9999999999', now() + interval '1 day', 2500)
ON CONFLICT DO NOTHING;

-- After running: verify with
-- SELECT * FROM partners;
-- SELECT * FROM services;
-- SELECT * FROM centers;
-- SELECT * FROM slots;
-- SELECT * FROM bookings;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic policies for development (replace with stricter ones for production)
CREATE POLICY "Public read access for services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access for centers" ON centers FOR SELECT USING (true);
CREATE POLICY "Public read access for slots" ON slots FOR SELECT USING (true);

-- User policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Booking policies
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'partner'))
);

-- Review policies
CREATE POLICY "Public read access for reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

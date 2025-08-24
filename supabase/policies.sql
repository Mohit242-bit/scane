-- Production Row Level Security (RLS) policies for ScanEzy
-- Run this in Supabase SQL Editor after creating tables.

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for services" ON services;
DROP POLICY IF EXISTS "Public read access for centers" ON centers;
DROP POLICY IF EXISTS "Public read access for slots" ON slots;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
DROP POLICY IF EXISTS "Public read access for reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;

-- Users table policies
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Partners table policies
CREATE POLICY "partners_select_own" ON partners FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "partners_insert_own" ON partners FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "partners_update_own" ON partners FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Services table policies
CREATE POLICY "services_select_public" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "services_select_all_for_partners" ON services FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (p.id = services.partner_id OR u.role = 'admin')
  )
);
CREATE POLICY "services_insert_partner" ON services FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND p.id = services.partner_id
  )
);
CREATE POLICY "services_update_partner" ON services FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (p.id = services.partner_id OR u.role = 'admin')
  )
);

-- Centers table policies
CREATE POLICY "centers_select_public" ON centers FOR SELECT USING (is_active = true);
CREATE POLICY "centers_select_all_for_partners" ON centers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (p.id = centers.partner_id OR u.role = 'admin')
  )
);
CREATE POLICY "centers_insert_partner" ON centers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND p.id = centers.partner_id
  )
);
CREATE POLICY "centers_update_partner" ON centers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM partners p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (p.id = centers.partner_id OR u.role = 'admin')
  )
);

-- Slots table policies
CREATE POLICY "slots_select_available" ON slots FOR SELECT USING (
  status IN ('available', 'booked') AND 
  EXISTS (SELECT 1 FROM centers WHERE centers.id = slots.center_id AND centers.is_active = true)
);
CREATE POLICY "slots_select_all_for_partners" ON slots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM centers c
    JOIN partners p ON c.partner_id = p.id
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (c.id = slots.center_id OR u.role = 'admin')
  )
);
CREATE POLICY "slots_insert_partner" ON slots FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM centers c
    JOIN partners p ON c.partner_id = p.id
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND c.id = slots.center_id
  )
);
CREATE POLICY "slots_update_partner" ON slots FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM centers c
    JOIN partners p ON c.partner_id = p.id
    JOIN users u ON p.user_id = u.id 
    WHERE u.id = auth.uid() AND (c.id = slots.center_id OR u.role = 'admin')
  )
);

-- Bookings table policies
CREATE POLICY "bookings_select_own" ON bookings FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'partner')
  )
);
CREATE POLICY "bookings_insert_authenticated" ON bookings FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "bookings_update_own_or_admin" ON bookings FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'partner')
  )
);

-- Reviews table policies
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Notifications table policies
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (
  user_id = auth.uid()
);

-- Audit logs policies (admin only)
CREATE POLICY "audit_logs_admin_only" ON audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

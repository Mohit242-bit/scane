-- Step 2: Create all tables (no inserts)
-- Run this after dropping tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Users table (extends Supabase auth.users)
CREATE TABLE users (
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
CREATE TABLE partners (
	id serial PRIMARY KEY,
	user_id uuid REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE services (
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
CREATE TABLE centers (
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
CREATE TABLE slots (
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
CREATE TABLE bookings (
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
CREATE TABLE reviews (
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
CREATE TABLE notifications (
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
CREATE TABLE audit_logs (
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

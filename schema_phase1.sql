-- Phase 1 Features: Advanced Clinic Management

-- Treatment Plans
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  clinic_id UUID REFERENCES clinics(id),
  title VARCHAR(255) NOT NULL,
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PROPOSED', -- PROPOSED, IN_PROGRESS, COMPLETED, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS treatment_plan_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
  stage_name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Lab Orders
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  clinic_id UUID REFERENCES clinics(id),
  lab_name VARCHAR(255) NOT NULL,
  work_description TEXT NOT NULL,
  tooth_number VARCHAR(10),
  shade VARCHAR(50),
  sent_date DATE NOT NULL,
  expected_date DATE,
  received_date DATE,
  cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'SENT', -- SENT, RECEIVED, DELIVERED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Patient Documents (X-Rays, Images, Consent Forms)
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  clinic_id UUID REFERENCES clinics(id),
  document_type VARCHAR(50) NOT NULL, -- XRAY, PHOTO, CONSENT, OTHER
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add Row Level Security (RLS) if enabled, otherwise just normal tables. Since existing tables use RLS or maybe they don't explicitly enforce it on server side for admin dashboard. Let's just create tables.

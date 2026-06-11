-- Schema v3: Multi-Clinic Architecture Migration

-- 1. Create Clinics Table (Replacing clinic_settings)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Main Clinic',
    address TEXT,
    contact_email VARCHAR(255),
    contact_mobile VARCHAR(20),
    gst_number VARCHAR(50),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert Default Clinic
INSERT INTO clinics (id, name, address) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Main Clinic', 'Headquarters')
ON CONFLICT (id) DO NOTHING;

-- 3. Update Profiles to belong to a clinic
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE profiles SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE profiles ALTER COLUMN clinic_id SET NOT NULL;

-- 4. Add clinic_id to all core data tables
-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE patients SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE patients ALTER COLUMN clinic_id SET NOT NULL;

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE appointments SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE appointments ALTER COLUMN clinic_id SET NOT NULL;

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE invoices SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE invoices ALTER COLUMN clinic_id SET NOT NULL;

-- Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE payments SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE payments ALTER COLUMN clinic_id SET NOT NULL;

-- Inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE inventory SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE inventory ALTER COLUMN clinic_id SET NOT NULL;

-- Inventory Purchases
ALTER TABLE inventory_purchases ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE inventory_purchases SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE inventory_purchases ALTER COLUMN clinic_id SET NOT NULL;

-- Staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE staff SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE staff ALTER COLUMN clinic_id SET NOT NULL;

-- Staff Attendance
ALTER TABLE staff_attendance ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE staff_attendance SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE staff_attendance ALTER COLUMN clinic_id SET NOT NULL;

-- Staff Leaves
ALTER TABLE staff_leaves ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE staff_leaves SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE staff_leaves ALTER COLUMN clinic_id SET NOT NULL;

-- Doctor Schedules
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE doctor_schedules SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE doctor_schedules ALTER COLUMN clinic_id SET NOT NULL;

-- Medical History
ALTER TABLE medical_history ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE medical_history SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE medical_history ALTER COLUMN clinic_id SET NOT NULL;

-- Dental Chart
ALTER TABLE dental_chart ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE dental_chart SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE dental_chart ALTER COLUMN clinic_id SET NOT NULL;

-- Prescriptions
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE prescriptions SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE prescriptions ALTER COLUMN clinic_id SET NOT NULL;

-- Notification Templates
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE notification_templates SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE notification_templates ALTER COLUMN clinic_id SET NOT NULL;

-- Audit Logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;
UPDATE audit_logs SET clinic_id = '00000000-0000-0000-0000-000000000000' WHERE clinic_id IS NULL;
ALTER TABLE audit_logs ALTER COLUMN clinic_id SET NOT NULL;

-- Update constraints to include clinic_id uniqueness where applicable
-- For example, patient case numbers should be unique per clinic, not globally
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_case_number_key;
ALTER TABLE patients ADD CONSTRAINT patients_case_number_clinic_key UNIQUE (case_number, clinic_id);

-- Staff attendance should be unique per staff per date
-- (Already handled by staff_id, date, which implies clinic_id since staff belongs to clinic)

-- Notification templates name per clinic
ALTER TABLE notification_templates DROP CONSTRAINT IF EXISTS notification_templates_type_name_key;
ALTER TABLE notification_templates ADD CONSTRAINT notification_templates_type_name_clinic_key UNIQUE (type, name, clinic_id);

-- Dental chart tooth number per patient
-- (Already handled since patient belongs to clinic)

-- Doctor schedules per day per doctor
-- (Already handled)

-- Enable RLS on core tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's clinic_id from JWT
-- Note: Requires Supabase Auth to inject user metadata into JWT,
-- OR we can look up the user's clinic_id from the profiles table.
-- Supabase by default provides auth.uid()
CREATE OR REPLACE FUNCTION auth.clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for Patients
CREATE POLICY "Clinic Staff Can Access Own Patients" ON patients
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Appointments
CREATE POLICY "Clinic Staff Can Access Own Appointments" ON appointments
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Invoices
CREATE POLICY "Clinic Staff Can Access Own Invoices" ON invoices
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Payments
CREATE POLICY "Clinic Staff Can Access Own Payments" ON payments
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Inventory
CREATE POLICY "Clinic Staff Can Access Own Inventory" ON inventory
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Medical History
CREATE POLICY "Clinic Staff Can Access Own Medical History" ON medical_history
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Dental Chart
CREATE POLICY "Clinic Staff Can Access Own Dental Chart" ON dental_chart
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- RLS Policies for Prescriptions
CREATE POLICY "Clinic Staff Can Access Own Prescriptions" ON prescriptions
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

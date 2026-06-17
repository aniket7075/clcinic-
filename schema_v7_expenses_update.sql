-- Update Expenses Table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255);

-- Enable RLS on expenses if not already enabled
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Expenses
DROP POLICY IF EXISTS "Clinic Staff Can Access Own Expenses" ON expenses;

CREATE POLICY "Clinic Staff Can Access Own Expenses" ON expenses
  FOR ALL USING (
    auth.user_role() = 'SUPER_ADMIN' OR clinic_id = auth.clinic_id()
  );

-- Phase 7: Add subscription columns to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 month');

-- Update any existing nulls
UPDATE clinics SET subscription_plan = 'starter' WHERE subscription_plan IS NULL;
UPDATE clinics SET subscription_status = 'active' WHERE subscription_status IS NULL;
UPDATE clinics SET subscription_expiry = now() + interval '1 month' WHERE subscription_expiry IS NULL;

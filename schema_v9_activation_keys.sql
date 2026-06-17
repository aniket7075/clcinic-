-- Drop the previous clinic_requests table as we are moving to Activation Key model
DROP TABLE IF EXISTS clinic_requests;

-- Create Activation Keys table
CREATE TABLE IF NOT EXISTS activation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_code VARCHAR(50) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'PRO', -- STARTER, PRO, ENTERPRISE
    duration_days INTEGER NOT NULL DEFAULT 365,
    is_used BOOLEAN DEFAULT FALSE,
    used_by_clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

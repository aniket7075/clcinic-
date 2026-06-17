-- Phase 10: Custom Feature Toggles and Activation Keys

-- 1. Add custom_features to clinics to allow a la carte feature assignment
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS custom_features JSONB DEFAULT '[]'::jsonb;

-- 2. Create activation_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS activation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_code TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by_clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add features JSONB to activation_keys (if it already existed but didn't have features)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activation_keys' AND column_name='features') THEN
        ALTER TABLE activation_keys ADD COLUMN features JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

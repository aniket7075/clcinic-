-- Create Clinic Requests table for SaaS registration
CREATE TABLE IF NOT EXISTS clinic_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    plan VARCHAR(50) NOT NULL DEFAULT 'PRO', -- STARTER, PRO, ENTERPRISE
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    password_hash VARCHAR(255) NOT NULL, -- Storing the requested password temporarily (hashed or raw if we create auth later)
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We store the password as plain text temporarily just for the sake of easy admin approval to create Supabase Auth User.
-- Ideally, the hospital sets their password via an email link *after* approval. 
-- But for a simple flow without email verification, we will store it and the backend will use it to create the user upon approval, then delete it or ignore it.

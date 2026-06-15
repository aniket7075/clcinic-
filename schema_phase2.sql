CREATE TABLE automated_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    reminder_type VARCHAR(50) DEFAULT 'WHATSAPP',
    status VARCHAR(50) DEFAULT 'SENT',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(appointment_id, reminder_type)
);

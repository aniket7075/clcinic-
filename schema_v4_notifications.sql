-- Schema v4: Notifications

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- If null, it's a broadcast to the whole clinic
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ERROR
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger
CREATE TRIGGER update_notifications_updated_at 
BEFORE UPDATE ON notifications 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

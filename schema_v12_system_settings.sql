CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default SMTP config if it doesn't exist
INSERT INTO system_settings (key, value)
VALUES (
    'smtp_config', 
    '{"host": "smtp.gmail.com", "port": 587, "secure": false, "user": "", "pass": "", "senderName": "Q Dent Admin"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

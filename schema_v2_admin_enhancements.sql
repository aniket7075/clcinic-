-- Schema v2: Admin Enhancements

-- 1. Doctor Schedules
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week)
);

-- 2. Staff Leaves
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS staff_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'SICK', -- SICK, CASUAL, UNPAID
    status leave_status DEFAULT 'PENDING',
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Staff Attendance
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY');

CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status attendance_status DEFAULT 'PRESENT',
    check_in TIME,
    check_out TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- 4. Inventory Suppliers
CREATE TABLE IF NOT EXISTS inventory_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    mobile VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inventory Purchases
CREATE TABLE IF NOT EXISTS inventory_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
    item_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notification Templates
CREATE TYPE notification_type AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'REMINDER');

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(type, name)
);

-- 7. Clinic Settings
CREATE TABLE IF NOT EXISTS clinic_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures only 1 row exists
    clinic_name VARCHAR(255) NOT NULL DEFAULT 'Dental Clinic Pro',
    logo_url TEXT,
    address TEXT,
    contact_email VARCHAR(255),
    contact_mobile VARCHAR(20),
    gst_number VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default clinic settings row
INSERT INTO clinic_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Apply updated_at triggers
CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_leaves_updated_at BEFORE UPDATE ON staff_leaves FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_attendance_updated_at BEFORE UPDATE ON staff_attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_suppliers_updated_at BEFORE UPDATE ON inventory_suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clinic_settings_updated_at BEFORE UPDATE ON clinic_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Audit Log Triggers
-- Note: 'audit_logs' table already exists. We will create a generic trigger function.

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    action_type VARCHAR(100);
    resource_id UUID;
    details JSONB;
BEGIN
    -- Try to capture the user ID if possible, usually through a session variable or similar.
    -- For simplicity, if not available in current transaction context, we log NULL or system.
    
    -- Determine operation
    IF (TG_OP = 'DELETE') THEN
        action_type := TG_OP;
        resource_id := OLD.id;
        details := row_to_json(OLD)::jsonb;
    ELSIF (TG_OP = 'UPDATE') THEN
        action_type := TG_OP;
        resource_id := NEW.id;
        details := jsonb_build_object('old', row_to_json(OLD)::jsonb, 'new', row_to_json(NEW)::jsonb);
    ELSIF (TG_OP = 'INSERT') THEN
        action_type := TG_OP;
        resource_id := NEW.id;
        details := row_to_json(NEW)::jsonb;
    END IF;

    -- Insert into audit_logs
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (NULL, action_type, TG_TABLE_NAME, resource_id, details); -- user_id is NULL because Postgres trigger lacks request context natively unless using RLS config.

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach Audit Triggers
DROP TRIGGER IF EXISTS audit_patients_trigger ON patients;
CREATE TRIGGER audit_patients_trigger AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_appointments_trigger ON appointments;
CREATE TRIGGER audit_appointments_trigger AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_invoices_trigger ON invoices;
CREATE TRIGGER audit_invoices_trigger AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event();

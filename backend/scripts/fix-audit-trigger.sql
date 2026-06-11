CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
    action_type VARCHAR(100);
    resource_id UUID;
    details JSONB;
    v_clinic_id UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        action_type := 'CREATE';
        resource_id := NEW.id;
        details := row_to_json(NEW);
    ELSIF (TG_OP = 'UPDATE') THEN
        action_type := 'UPDATE';
        resource_id := NEW.id;
        details := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        action_type := 'DELETE';
        resource_id := OLD.id;
        details := row_to_json(OLD);
    END IF;

    -- Try to get clinic_id if it exists in the NEW/OLD record
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            EXECUTE 'SELECT $1.clinic_id' USING OLD INTO v_clinic_id;
        ELSE
            EXECUTE 'SELECT $1.clinic_id' USING NEW INTO v_clinic_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_clinic_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END;

    IF v_clinic_id IS NULL THEN
        v_clinic_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;

    -- Insert into audit_logs
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, clinic_id)
    VALUES (NULL, action_type, TG_TABLE_NAME, resource_id, details, v_clinic_id);

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

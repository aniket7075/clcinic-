-- Rule mapping a specific treatment type (e.g. ROOT_CANAL) to inventory items to deduct
CREATE TABLE treatment_inventory_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    treatment_type VARCHAR(50) NOT NULL, -- e.g. 'ROOT_CANAL', 'EXTRACTION', 'FILLING'
    inventory_item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity_to_deduct INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We'll apply deductions via a backend function when a treatment is marked COMPLETED.

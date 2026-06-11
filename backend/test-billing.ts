import fs from 'fs';
import path from 'path';
import { supabase } from './src/config/supabase';

async function testInsert() {
  const clinicId = '00000000-0000-0000-0000-000000000000'; // Admin clinic
  const { data: patient } = await supabase.from('patients').select('id').eq('clinic_id', clinicId).limit(1).single();
  
  if (!patient) {
      console.log('No patient found to test');
      return;
  }

  const patient_id = patient.id;
  const items = [{ service_name: 'Test Service', quantity: 1, unit_price: 100, charge: 100 }];
  const discount = 0;
  const tax = 0;

  // Controller logic
  const total_amount = items.reduce((acc: number, item: any) => acc + Number(item.charge), 0);
  const final_amount = total_amount - Number(discount || 0) + Number(tax || 0);

  const payload = { clinic_id: clinicId, patient_id, total_amount, discount, tax, final_amount };
  console.log('Payload for invoices:', payload);

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error inserting invoice:', error);
    return;
  }
  console.log('Invoice created:', invoice.id);

  const itemsToInsert = items.map((item: any) => ({
    invoice_id: invoice.id,
    treatment_name: item.service_name || item.treatment_name,
    charge: item.charge
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error inserting items:', itemsError);
  } else {
    console.log('Items inserted successfully');
  }
}

testInsert();

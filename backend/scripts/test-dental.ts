import { supabase } from '../src/config/supabase';

const test = async () => {
  const { data, error } = await supabase
    .from('dental_chart')
    .upsert({
      patient_id: '76bb446c-f238-426f-a8c0-1139673be9bf',
      tooth_number: '8',
      clinic_id: '00000000-0000-0000-0000-000000000000', // assuming valid clinic
      status: 'UNHEALTHY'
    }, { onConflict: 'patient_id, tooth_number' })
    .select();
    
  console.log('Result:', data);
  console.log('Error:', error);
};

test();

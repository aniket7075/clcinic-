import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDummyData() {
  const clinicId = '00000000-0000-0000-0000-000000000000';

  console.log('Seeding dummy data for clinic:', clinicId);

  // 1. Ensure clinic exists
  const { error: clinicError } = await supabase.from('clinics').upsert({
    id: clinicId,
    name: 'Main Dental Clinic',
    address: '123 Dental Way, Smile City',
    contact_mobile: '555-0100',
    contact_email: 'info@maindental.com',
  });
  if (clinicError) console.error('Error upserting clinic:', clinicError.message);

  // 2. Create Doctors
  const doctors = [
    { email: 'dr.smith@clinic.com', firstName: 'John', lastName: 'Smith', role: 'DOCTOR' },
    { email: 'dr.doe@clinic.com', firstName: 'Jane', lastName: 'Doe', role: 'DOCTOR' }
  ];

  for (const doc of doctors) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: doc.email,
      password: 'password123',
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already been registered')) {
      console.error('Error creating auth user:', authError.message);
      continue;
    }

    const userId = authData?.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        role: doc.role,
        first_name: doc.firstName,
        last_name: doc.lastName,
        email: doc.email,
        clinic_id: clinicId
      });

      await supabase.from('staff').upsert({
        profile_id: userId,
        clinic_id: clinicId,
        employee_id: `EMP-${Math.floor(Math.random() * 1000)}`,
        designation: 'Senior Dentist',
        salary: 100000,
        joining_date: '2023-01-01'
      }, { onConflict: 'profile_id' });
      console.log(`Doctor ${doc.firstName} ${doc.lastName} created.`);
    }
  }

  // 3. Create Patients
  const patients = [
    { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', mobile: '555-0201', dob: '1990-05-15', gender: 'FEMALE', blood_group: 'O+', address: '123 Elm St' },
    { first_name: 'Bob', last_name: 'Williams', email: 'bob@example.com', mobile: '555-0202', dob: '1985-08-22', gender: 'MALE', blood_group: 'A-', address: '456 Oak St' },
    { first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', mobile: '555-0203', dob: '1992-11-10', gender: 'MALE', blood_group: 'B+', address: '789 Pine St' }
  ];

  const patientIds = [];
  for (const p of patients) {
    // Check if patient exists
    const { data: existingPat } = await supabase.from('patients').select('id').eq('email', p.email).single();
    
    if (existingPat) {
      patientIds.push(existingPat.id);
      continue;
    }

    const { data: patData, error: patError } = await supabase.from('patients').insert({
      ...p,
      clinic_id: clinicId,
      case_number: `CASE-${Math.floor(Math.random() * 10000)}`
    }).select().single();
    
    if (patError) {
        console.error('Error inserting patient:', patError.message);
    } else if (patData) {
        patientIds.push(patData.id);
    }
  }
  console.log(`Created ${patientIds.length} patients.`);

  // 4. Create Appointments
  if (patientIds.length > 0) {
      // Get a doctor id
      const { data: doctorStaff } = await supabase.from('profiles').select('id').eq('role', 'DOCTOR').limit(1).single();
      const doctorId = doctorStaff?.id;

      if (doctorId) {
          const today = new Date().toISOString().split('T')[0];
          const appointments = [
              { clinic_id: clinicId, patient_id: patientIds[0], doctor_id: doctorId, appointment_date: today, start_time: '09:00:00', end_time: '09:30:00', status: 'SCHEDULED', notes: 'Regular Checkup' },
              { clinic_id: clinicId, patient_id: patientIds[1], doctor_id: doctorId, appointment_date: today, start_time: '10:00:00', end_time: '11:00:00', status: 'SCHEDULED', notes: 'Root Canal Consultation' }
          ];

          for (const apt of appointments) {
              const { error: aptError } = await supabase.from('appointments').insert(apt);
              if (aptError) console.error('Error creating appointment:', aptError.message);
          }
          console.log('Created dummy appointments.');
      }
  }

  console.log('Dummy data seeding completed.');
}

seedDummyData();

import { supabase } from '../src/config/supabase';
import { localDb, initLocalDb } from '../src/config/sqlite';

async function runSync() {
  console.log('Initializing local DB...');
  initLocalDb();

  console.log('Fetching profiles...');
  const { data: profiles, error: errProfiles } = await supabase.from('profiles').select('*');
  if (errProfiles) console.error(errProfiles);
  else {
    const stmt = localDb.prepare('INSERT OR REPLACE INTO profiles (id, role, first_name, last_name, mobile, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    profiles.forEach(p => {
      stmt.run(p.id, p.role, p.first_name, p.last_name, p.mobile, p.email, p.created_at, p.updated_at);
    });
    console.log(`Synced ${profiles.length} profiles.`);
  }

  console.log('Fetching patients...');
  const { data: patients, error: errPatients } = await supabase.from('patients').select('*');
  if (errPatients) console.error(errPatients);
  else {
    const stmt = localDb.prepare('INSERT OR REPLACE INTO patients (id, clinic_id, case_number, first_name, last_name, mobile, alternate_mobile, email, gender, dob, age, blood_group, occupation, address, emergency_contact, photo_url, registration_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    patients.forEach(p => {
      stmt.run(p.id, p.clinic_id, p.case_number, p.first_name, p.last_name, p.mobile, p.alternate_mobile, p.email, p.gender, p.dob, p.age, p.blood_group, p.occupation, p.address, p.emergency_contact, p.photo_url, p.registration_date, p.created_at, p.updated_at);
    });
    console.log(`Synced ${patients.length} patients.`);
  }

  console.log('Fetching appointments...');
  const { data: appointments, error: errAppt } = await supabase.from('appointments').select('*');
  if (errAppt) console.error(errAppt);
  else {
    const stmt = localDb.prepare('INSERT OR REPLACE INTO appointments (id, clinic_id, patient_id, doctor_id, appointment_date, start_time, end_time, status, treatment_type, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    appointments.forEach(a => {
      stmt.run(a.id, a.clinic_id, a.patient_id, a.doctor_id, a.appointment_date, a.start_time, a.end_time, a.status, a.treatment_type, a.notes, a.created_at, a.updated_at);
    });
    console.log(`Synced ${appointments.length} appointments.`);
  }

  console.log('Initial sync complete.');
}

runSync().catch(console.error);

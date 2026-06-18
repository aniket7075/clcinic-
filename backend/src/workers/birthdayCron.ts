import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { whatsappService } from '../services/whatsapp.service';

const sendWhatsAppBirthdayGreeting = async (person: any, type: 'PATIENT' | 'STAFF') => {
  const name = type === 'PATIENT' ? `${person.first_name} ${person.last_name}` : `${person.first_name} ${person.last_name}`;
  const mobile = person.mobile;

  if (!mobile) return;

  console.log(`[WHATSAPP] Sending Birthday Wishes to ${name} (${type}) at ${mobile}`);
  const message = `Happy Birthday ${name}! Wishing you a fantastic day ahead! - Dental Clinic`;
  await whatsappService.sendMessage(mobile, message);
};

export const initBirthdayCron = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running automated WhatsApp birthday wishes job...');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth is 0-indexed
    const currentDay = today.getDate();

    try {
      // 1. Fetch patients with birthday today
      // Postgres extract day and month
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*');

      if (!patientsError && patients) {
        const birthdayPatients = patients.filter(p => {
          if (!p.dob) return false;
          const dob = new Date(p.dob);
          return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
        });

        for (const patient of birthdayPatients) {
          await sendWhatsAppBirthdayGreeting(patient, 'PATIENT');
        }
      }

      // 2. Fetch staff (profiles) with birthday today
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (!profilesError && profiles) {
        const birthdayStaff = profiles.filter(p => {
          if (!p.dob) return false;
          const dob = new Date(p.dob);
          return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
        });

        for (const staff of birthdayStaff) {
          await sendWhatsAppBirthdayGreeting(staff, 'STAFF');
        }
      }

      console.log('[CRON] Birthday wishes job completed.');
    } catch (error) {
      console.error('[CRON] Error in birthday wishes job:', error);
    }
  });
};

import cron from 'node-cron';
import { supabase } from '../config/supabase';

// Run every minute
export const initCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Look for appointments in the next 30 minutes
      const now = new Date();
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);
      
      const targetDate = thirtyMinsFromNow.toISOString().split('T')[0];
      
      // We want to match the time exactly. The DB stores start_time as 'HH:MM:SS'.
      // We'll format thirtyMinsFromNow to 'HH:MM'
      const targetHour = thirtyMinsFromNow.getHours().toString().padStart(2, '0');
      const targetMinute = thirtyMinsFromNow.getMinutes().toString().padStart(2, '0');
      const timePattern = `${targetHour}:${targetMinute}`;

      // Fetch appointments that start at this minute
      const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          clinic_id,
          doctor_id,
          start_time,
          patients (first_name, last_name)
        `)
        .eq('appointment_date', targetDate)
        .gte('start_time', `${timePattern}:00`)
        .lt('start_time', `${timePattern}:59`)
        .eq('status', 'SCHEDULED');

      if (fetchError) throw fetchError;

      if (appointments && appointments.length > 0) {
        for (const appt of appointments) {
          const patientName = `${(appt.patients as any)?.first_name} ${(appt.patients as any)?.last_name}`;
          const message = `Reminder: Appointment with ${patientName} starts in 30 minutes (${appt.start_time.substring(0, 5)}).`;

          const notifications = [];

          // 1. Notify the doctor
          if (appt.doctor_id) {
            notifications.push({
              clinic_id: appt.clinic_id,
              user_id: appt.doctor_id,
              title: 'Upcoming Appointment',
              message,
              type: 'INFO'
            });
          }

          // 2. Broadcast to Clinic Admins (user_id = null)
          notifications.push({
            clinic_id: appt.clinic_id,
            user_id: null, // Broadcast
            title: 'Upcoming Appointment',
            message,
            type: 'INFO'
          });

          // Insert notifications
          await supabase.from('notifications').insert(notifications);
          console.log(`[Cron] Sent reminders for appointment ${appt.id}`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running appointment reminders:', error);
    }
  });

  console.log('[Cron] Appointment reminder job initialized.');
};

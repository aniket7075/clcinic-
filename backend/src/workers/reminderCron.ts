import cron from 'node-cron';
import { supabase } from '../config/supabase';

// Helper to format date as YYYY-MM-DD
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const sendWhatsAppReminder = async (appointment: any) => {
  const patientName = `${appointment.patients?.first_name} ${appointment.patients?.last_name}`;
  const time = appointment.start_time;
  const date = appointment.appointment_date;
  const mobile = appointment.patients?.mobile;

  const message = `Hello ${patientName},\n\nThis is a friendly reminder from Q DENT Clinic that you have an appointment tomorrow (${date}) at ${time}.\n\nPlease let us know if you need to reschedule. We look forward to seeing you!`;

  // SIMULATE sending message by logging it.
  // In a real app, you would use Twilio, Meta WhatsApp API, or WATI here.
  console.log(`[WHATSAPP API SIMULATION] Sending to ${mobile}:`);
  console.log(`-------------------------------------------------`);
  console.log(message);
  console.log(`-------------------------------------------------`);

  // Log to database
  const { error } = await supabase.from('automated_reminders').insert({
    appointment_id: appointment.id,
    patient_id: appointment.patients?.id,
    reminder_type: 'WHATSAPP',
    status: 'SENT'
  });

  if (error) {
    console.error(`Failed to log reminder for appointment ${appointment.id}:`, error);
  } else {
    console.log(`Reminder logged successfully for appointment ${appointment.id}`);
  }
};

export const initReminderCron = () => {
  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running automated WhatsApp reminder job...');
    try {
      const tomorrowStr = getTomorrowDateString();

      // Fetch appointments for tomorrow that are SCHEDULED or CONFIRMED
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id, appointment_date, start_time, status, patients(id, first_name, last_name, mobile)')
        .eq('appointment_date', tomorrowStr)
        .in('status', ['SCHEDULED', 'CONFIRMED']);

      if (error) {
        throw error;
      }

      if (!appointments || appointments.length === 0) {
        console.log('[CRON] No appointments found for tomorrow.');
        return;
      }

      // Find which ones already got a reminder
      const appointmentIds = appointments.map(a => a.id);
      const { data: existingReminders } = await supabase
        .from('automated_reminders')
        .select('appointment_id')
        .in('appointment_id', appointmentIds)
        .eq('reminder_type', 'WHATSAPP');

      const sentIds = new Set(existingReminders?.map(r => r.appointment_id) || []);

      let sentCount = 0;
      for (const rawAppointment of appointments) {
        const appointment = rawAppointment as any;
        if (!sentIds.has(appointment.id) && appointment.patients?.mobile) {
          await sendWhatsAppReminder(appointment);
          sentCount++;
        }
      }

      console.log(`[CRON] Reminder job completed. Sent ${sentCount} reminders.`);
    } catch (err) {
      console.error('[CRON] Error running reminder job:', err);
    }
  });

  console.log('[CRON] Reminder cron job initialized. Scheduled for 08:00 AM daily.');
};

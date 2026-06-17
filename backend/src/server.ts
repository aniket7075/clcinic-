import app from './app';
import dotenv from 'dotenv';
import { initCronJobs } from './jobs/appointmentReminders';
import { initReminderCron } from './workers/reminderCron';
import { initLocalDb } from './config/sqlite';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initLocalDb(); // Initialize SQLite DB backup
  initCronJobs(); // Initialize background tasks
  initReminderCron(); // Initialize WhatsApp reminders
});

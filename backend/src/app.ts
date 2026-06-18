import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Dental Clinic API is running' });
});

import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patients.routes';
import appointmentRoutes from './routes/appointments.routes';
import treatmentRoutes from './routes/treatments.routes';
import billingRoutes from './routes/billing.routes';
import inventoryRoutes from './routes/inventory.routes';
import staffRoutes from './routes/staff.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportsRoutes from './routes/reports.routes';
import settingsRoutes from './routes/settings.routes';
import notificationsRoutes from './routes/notifications.routes';
import clinicsRoutes from './routes/clinics.routes';
import publicRoutes from './routes/public.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import expensesRoutes from './routes/expenses.routes';
import systemRoutes from './routes/system.routes';

// Setup routes here later
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/clinics', clinicsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/system', systemRoutes);

export default app;

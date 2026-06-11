import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Total Patients
    const { count: totalPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', req.user.clinic_id);

    // Total Doctors & Staff
    const { count: totalDoctors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('clinic_id', req.user.clinic_id).eq('role', 'DOCTOR');
    const { count: totalStaff } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('clinic_id', req.user.clinic_id).neq('role', 'SUPER_ADMIN').neq('role', 'DOCTOR');

    // Today's Appointments
    const { count: todayAppointments } = await supabase.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', req.user.clinic_id)
      .eq('appointment_date', today);

    // Monthly Appointments
    const { count: monthlyAppointments } = await supabase.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', req.user.clinic_id)
      .gte('appointment_date', firstDayOfMonth);

    // Revenue
    const { data: todayRevenueData } = await supabase.from('payments')
      .select('amount')
      .eq('clinic_id', req.user.clinic_id)
      .gte('payment_date', today);
    const todayRevenue = todayRevenueData?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0;

    const { data: monthlyRevenueData } = await supabase.from('payments')
      .select('amount')
      .eq('clinic_id', req.user.clinic_id)
      .gte('payment_date', firstDayOfMonth);
    const monthlyRevenue = monthlyRevenueData?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0;

    // Pending Payments
    const { data: pendingInvoices } = await supabase.from('invoices')
      .select('final_amount')
      .eq('clinic_id', req.user.clinic_id)
      .neq('status', 'PAID');
    const pendingPayments = pendingInvoices?.reduce((acc: number, i: any) => acc + Number(i.final_amount), 0) || 0;

    // Follow-up Patients
    const { count: followUpPatients } = await supabase.from('medical_history')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', req.user.clinic_id)
      .eq('follow_up_date', today);

    // Low Stock Alerts
    const { data: inventoryData } = await supabase.from('inventory').select('*').eq('clinic_id', req.user.clinic_id);
    const lowStockAlerts = inventoryData?.filter((i: any) => i.quantity <= i.low_stock_threshold).length || 0;

    res.status(200).json({
      totalPatients: totalPatients || 0,
      totalDoctors: totalDoctors || 0,
      totalStaff: totalStaff || 0,
      todayAppointments: todayAppointments || 0,
      monthlyAppointments: monthlyAppointments || 0,
      todayRevenue,
      monthlyRevenue,
      pendingPayments,
      followUpPatients: followUpPatients || 0,
      lowStockAlerts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

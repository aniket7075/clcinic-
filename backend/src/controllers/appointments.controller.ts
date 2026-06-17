import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { DbService } from '../services/db.service';

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*), profiles(first_name, last_name)')
      .eq('clinic_id', req.user.clinic_id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*), profiles(first_name, last_name)')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const appointmentData = { ...req.body, clinic_id: req.user.clinic_id };
  try {
    const data = await DbService.insert('appointments', appointmentData);

    // TODO: Trigger SMS/WhatsApp notification here

    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const data = await DbService.update('appointments', id as string, updateData);

    // TODO: Trigger SMS/WhatsApp notification if status changed to CANCELLED or RESCHEDULED

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, case_number, photo_url)')
      .eq('appointment_date', today)
      .eq('clinic_id', req.user.clinic_id)
      .in('status', ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'])
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAppointmentsByMonth = async (req: AuthRequest, res: Response): Promise<void> => {
  const { year, month } = req.params;
  try {
    const monthStr = String(month);
    const yearStr = String(year);
    const startDate = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
    const nextMonth = Number(monthStr) === 12 ? 1 : Number(monthStr) + 1;
    const nextYear = Number(monthStr) === 12 ? Number(yearStr) + 1 : Number(yearStr);
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*), profiles(first_name, last_name)')
      .eq('clinic_id', req.user.clinic_id)
      .gte('appointment_date', startDate)
      .lt('appointment_date', endDate)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

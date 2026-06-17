import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { DbService } from '../services/db.service';

export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  const patientData = { ...req.body, clinic_id: req.user.clinic_id };
  
  if (patientData.dob && !patientData.age) {
    const dob = new Date(patientData.dob);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    patientData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  try {
    const data = await DbService.insert('patients', patientData);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (updateData.dob) {
    const dob = new Date(updateData.dob);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    updateData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  try {
    const data = await DbService.update('patients', id, updateData);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const searchPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  const { query } = req.query; // Search by name, case_number, or mobile
  if (!query) {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .or(`case_number.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,mobile.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatientTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Fetch Medical History
    const { data: history, error: hError } = await supabase.from('medical_history').select('*').eq('patient_id', id).eq('clinic_id', req.user.clinic_id);
    if (hError) throw hError;

    // Fetch Prescriptions
    const { data: prescriptions, error: pError } = await supabase.from('prescriptions').select('*, prescription_items(*)').eq('patient_id', id).eq('clinic_id', req.user.clinic_id);
    if (pError) throw pError;

    // Fetch Appointments
    const { data: appointments, error: aError } = await supabase.from('appointments').select('*').eq('patient_id', id).eq('clinic_id', req.user.clinic_id);
    if (aError) throw aError;

    res.status(200).json({
      history: history || [],
      prescriptions: prescriptions || [],
      appointments: appointments || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

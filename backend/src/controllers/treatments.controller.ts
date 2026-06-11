import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

// Medical History
export const getMedicalHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', req.user.clinic_id)
      .order('visit_date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const recordData = { ...req.body, clinic_id: req.user.clinic_id };
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .insert([recordData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Dental Chart
export const getDentalChart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const { data, error } = await supabase
      .from('dental_chart')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateToothStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId, toothNumber } = req.params;
  const { status, notes, updated_by } = req.body;

  try {
    const { data, error } = await supabase
      .from('dental_chart')
      .upsert({
        patient_id: patientId,
        tooth_number: toothNumber,
        clinic_id: req.user.clinic_id,
        status: status?.toUpperCase(),
        notes,
        updated_by
      }, { onConflict: 'patient_id, tooth_number' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Prescriptions
export const getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*, prescription_items(*)')
      .eq('patient_id', patientId)
      .eq('clinic_id', req.user.clinic_id)
      .order('prescription_date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patient_id, doctor_id, appointment_id, instructions, items } = req.body;
  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .insert([{ clinic_id: req.user.clinic_id, patient_id, doctor_id, appointment_id, instructions }])
      .select()
      .single();

    if (error) throw error;

    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        prescription_id: prescription.id,
        medicine: item.medicine_name,
        dosage: item.dosage + (item.frequency ? ` (${item.frequency})` : ''),
        duration: item.duration
      }));
      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }

    res.status(201).json(prescription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { generatePrescriptionPDF } from '../utils/pdfGenerator';

export const exportPrescriptionPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { prescriptionId } = req.params;
  try {
    // Fetch prescription details
    const { data: prescription, error: prescError } = await supabase
      .from('prescriptions')
      .select('*, prescription_items(*), doctor:profiles!doctor_id(first_name, last_name)')
      .eq('id', prescriptionId)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (prescError || !prescription) throw new Error('Prescription not found');

    // Fetch patient details
    const { data: patient, error: patError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', prescription.patient_id)
      .eq('clinic_id', req.user.clinic_id)
      .single();
      
    if (patError || !patient) throw new Error('Patient not found');

    // Fetch clinic details
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', req.user.clinic_id)
      .single();

    generatePrescriptionPDF(res, prescription, patient, clinic);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

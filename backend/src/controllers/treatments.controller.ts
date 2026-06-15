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

// Treatment Plans
export const getTreatmentPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const { data, error } = await supabase
      .from('treatment_plans')
      .select('*, stages:treatment_plan_stages(*)')
      .eq('patient_id', patientId)
      .eq('clinic_id', req.user.clinic_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTreatmentPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patient_id, title, total_estimated_cost, status, stages } = req.body;
  try {
    const { data: plan, error } = await supabase
      .from('treatment_plans')
      .insert([{ 
        clinic_id: req.user.clinic_id, 
        patient_id, 
        doctor_id: req.user.id, 
        title, 
        total_estimated_cost, 
        status 
      }])
      .select()
      .single();

    if (error) throw error;

    if (stages && stages.length > 0) {
      const stagesToInsert = stages.map((s: any) => ({
        plan_id: plan.id,
        stage_name: s.stage_name,
        description: s.description,
        estimated_cost: s.estimated_cost,
        status: s.status || 'PENDING'
      }));
      const { error: stagesError } = await supabase
        .from('treatment_plan_stages')
        .insert(stagesToInsert);
      
      if (stagesError) throw stagesError;
    }

    res.status(201).json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTreatmentPlanStage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { stageId } = req.params;
  const { status, completed_at } = req.body;
  try {
    const { data, error } = await supabase
      .from('treatment_plan_stages')
      .update({ status, completed_at })
      .eq('id', stageId)
      .select()
      .single();
      
    if (error) throw error;

    // Phase 4: Smart Inventory Deductions
    if (status === 'COMPLETED' && data.stage_name) {
      // Find rules for this treatment type
      const { data: rules } = await supabase
        .from('treatment_inventory_rules')
        .select('*')
        .eq('clinic_id', req.user.clinic_id)
        .eq('treatment_type', data.stage_name.toUpperCase().replace(/\s+/g, '_'));

      if (rules && rules.length > 0) {
        for (const rule of rules) {
          // Fetch current inventory
          const { data: item } = await supabase
            .from('inventory')
            .select('current_stock')
            .eq('id', rule.inventory_item_id)
            .single();

          if (item) {
            const newStock = Math.max(0, item.current_stock - rule.quantity_to_deduct);
            await supabase
              .from('inventory')
              .update({ current_stock: newStock })
              .eq('id', rule.inventory_item_id);
          }
        }
      }
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Lab Orders
export const getLabOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.query; // optional
  try {
    let query = supabase
      .from('lab_orders')
      .select('*, patient:patients(first_name, last_name, mobile)')
      .eq('clinic_id', req.user.clinic_id)
      .order('sent_date', { ascending: false });
      
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createLabOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderData = { ...req.body, clinic_id: req.user.clinic_id, doctor_id: req.user.id };
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLabOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .update(updateData)
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Patient Documents
export const getPatientDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const { data, error } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', req.user.clinic_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPatientDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const docData = { ...req.body, clinic_id: req.user.clinic_id, doctor_id: req.user.id };
  try {
    const { data, error } = await supabase
      .from('patient_documents')
      .insert([docData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePatientDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('patient_documents')
      .delete()
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

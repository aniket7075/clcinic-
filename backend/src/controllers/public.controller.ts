import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Public route to get clinic details and doctors
export const getClinicBookingInfo = async (req: Request, res: Response): Promise<void> => {
  const { clinicId } = req.params;
  try {
    // Get clinic details
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('name, address, phone')
      .eq('id', clinicId)
      .single();

    if (clinicError || !clinic) throw new Error('Clinic not found');

    // Get doctors for this clinic
    const { data: doctors, error: doctorsError } = await supabase
      .from('staff')
      .select('profile_id, profiles!profile_id(first_name, last_name, specialty)')
      .eq('clinic_id', clinicId);
      // Ideally we'd filter by role='DOCTOR' but since we might not have it in the staff table directly,
      // we filter on the frontend or join with profiles.

    if (doctorsError) throw doctorsError;

    res.status(200).json({ clinic, doctors });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Public route to submit an appointment
export const submitPublicAppointment = async (req: Request, res: Response): Promise<void> => {
  const { clinicId } = req.params;
  const { first_name, last_name, mobile, doctor_id, appointment_date, start_time, notes } = req.body;
  
  try {
    // 1. Check if patient exists by mobile, else create
    let patientId = null;
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('mobile', mobile)
      .single();

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const { data: newPatient, error: newPatientError } = await supabase
        .from('patients')
        .insert([{ clinic_id: clinicId, first_name, last_name, mobile }])
        .select()
        .single();
      if (newPatientError) throw newPatientError;
      patientId = newPatient.id;
    }

    // 2. Create unconfirmed appointment
    // Assume 30 min default duration
    const [h, m] = start_time.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10) + 30);
    const end_time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: clinicId,
        patient_id: patientId,
        doctor_id,
        appointment_date,
        start_time,
        end_time,
        notes: `ONLINE BOOKING: ${notes}`,
        status: 'UNCONFIRMED'
      }])
      .select()
      .single();

    if (aptError) throw aptError;

    res.status(201).json({ message: 'Appointment requested successfully', appointment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

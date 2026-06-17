import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { sendAdminNotificationEmail } from '../services/email.service';

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

// SaaS Public Registration
export const registerClinicRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinic_name, owner_name, email, phone, plan, billing_cycle } = req.body;
    
    // Check if email already registered in requests
    const { data: existingReq } = await supabase
      .from('clinic_requests')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingReq) {
      res.status(400).json({ error: 'A request with this email is already pending.' });
      return;
    }

    const { data, error } = await supabase
      .from('clinic_requests')
      .insert({
        clinic_name,
        owner_name,
        email,
        phone,
        plan: plan ? plan.toUpperCase() : 'PRO',
        billing_cycle: billing_cycle ? billing_cycle.toUpperCase() : 'MONTHLY',
        password_hash: 'PENDING', // Password no longer collected here
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Fetch SYSTEM_ADMIN email
    const { data: sysAdmin } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'SYSTEM_ADMIN')
      .limit(1)
      .single();

    const adminEmail = sysAdmin?.email;

    // Notify system admin
    await sendAdminNotificationEmail(
      clinic_name, 
      owner_name, 
      email, 
      phone, 
      plan ? plan.toUpperCase() : 'PRO', 
      billing_cycle ? billing_cycle.toUpperCase() : 'MONTHLY',
      adminEmail
    ).catch(err => console.error("Admin email failed:", err));

    res.status(201).json({ message: 'Registration request submitted successfully', request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// SaaS Product Activation
export const activateClinic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activation_key, email, password } = req.body;

    // 1. Verify Activation Key
    const { data: keyData, error: keyError } = await supabase
      .from('activation_keys')
      .select('*')
      .eq('key_code', activation_key)
      .single();

    if (keyError || !keyData) {
      res.status(400).json({ error: 'Invalid Activation Key.' });
      return;
    }

    if (keyData.is_used) {
      res.status(400).json({ error: 'This Activation Key has already been used.' });
      return;
    }

    // 2. Find the original request to get Clinic details
    const { data: request, error: reqError } = await supabase
      .from('clinic_requests')
      .select('*')
      .eq('email', email)
      .eq('status', 'APPROVED')
      .single();

    if (reqError || !request) {
      res.status(400).json({ error: 'No approved request found for this email.' });
      return;
    }

    // 3. Create the Clinic
    const expiryDate = new Date(Date.now() + keyData.duration_days * 24 * 60 * 60 * 1000);
    const { data: newClinic, error: clinicError } = await supabase
      .from('clinics')
      .insert([{
        name: request.clinic_name,
        contact_email: request.email,
        contact_mobile: request.phone,
        subscription_plan: keyData.plan,
        subscription_status: 'ACTIVE',
        subscription_expiry: expiryDate.toISOString(),
        custom_features: keyData.features || [],
        is_active: true
      }])
      .select()
      .single();

    if (clinicError) throw clinicError;

    // 4. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      await supabase.from('clinics').delete().eq('id', newClinic.id);
      throw authError;
    }

    const [firstName, ...lastNames] = request.owner_name.split(' ');
    const lastName = lastNames.join(' ');

    // 5. Update Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName || '.',
        role: 'CLINIC_ADMIN',
        clinic_id: newClinic.id
      })
      .eq('id', authUser.user.id);

    if (profileError) throw profileError;

    // 6. Mark Key as Used
    await supabase
      .from('activation_keys')
      .update({ is_used: true, used_by_clinic_id: newClinic.id, used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    res.status(200).json({ message: 'Activation successful! You can now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getClinics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        profiles(first_name, last_name, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, contact_email, contact_mobile, gst_number, subscription_plan, subscription_status, subscription_expiry } = req.body;
  try {
    // Default to 60-day trial if not specified
    const expiryDate = subscription_expiry ? new Date(subscription_expiry) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('clinics')
      .insert([{ 
        name, 
        address, 
        contact_email, 
        contact_mobile, 
        gst_number, 
        is_active: true,
        subscription_plan: subscription_plan || 'starter',
        subscription_status: subscription_status || 'TRIAL',
        subscription_expiry: expiryDate.toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, address, contact_email, contact_mobile, gst_number, is_active, subscription_plan, subscription_status, subscription_expiry } = req.body;
  try {
    const updateData: any = { name, address, contact_email, contact_mobile, gst_number, is_active };
    if (subscription_plan) updateData.subscription_plan = subscription_plan;
    if (subscription_status) updateData.subscription_status = subscription_status;
    if (subscription_expiry) updateData.subscription_expiry = new Date(subscription_expiry).toISOString();

    const { data, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // Prevent deleting the main clinic if it's the very first default one
  if (id === '00000000-0000-0000-0000-000000000000') {
    res.status(400).json({ error: 'Cannot delete the default Main Clinic' });
    return;
  }

  try {
    // Attempt hard delete first
    const { error: deleteError } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id);

    if (deleteError) {
      // If it fails due to foreign key constraints, fallback to soft delete
      if (deleteError.code === '23503') { // Postgres foreign key violation code
        const { error: softDeleteError } = await supabase
          .from('clinics')
          .update({ is_active: false })
          .eq('id', id);

        if (softDeleteError) throw softDeleteError;
        res.status(200).json({ message: 'Clinic has associated data. Soft-deleted instead.' });
        return;
      }
      throw deleteError;
    }

    res.status(200).json({ message: 'Clinic hard-deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { sendActivationEmail } from '../services/email.service';

// System Admin: Get all clinic requests
export const getClinicRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('clinic_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// System Admin: Approve a clinic request (Generates Key & Sends Email)
export const approveClinicRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { duration_days, plan, features } = req.body;

  try {
    // 1. Fetch request details
    const { data: request, error: reqError } = await supabase
      .from('clinic_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (reqError || !request) throw new Error('Request not found');
    if (request.status !== 'PENDING') {
      res.status(400).json({ error: `Request already ${request.status}` });
      return;
    }

    // 2. Generate Activation Key
    const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const keyCode = `QDE-${randomPart()}-${randomPart()}-${randomPart()}`;
    
    // Determine duration based on billing cycle if not provided
    const finalDuration = duration_days ? parseInt(duration_days, 10) : (request.billing_cycle === 'YEARLY' ? 365 : (request.billing_cycle === 'HALF-YEARLY' ? 180 : 30));
    const finalPlan = plan || request.plan;
    const finalFeatures = features || [];

    const { data: activationKey, error: keyError } = await supabase
      .from('activation_keys')
      .insert([{
        key_code: keyCode,
        plan: finalPlan,
        duration_days: finalDuration,
        features: finalFeatures,
        is_used: false
      }])
      .select()
      .single();

    if (keyError) throw keyError;

    // 3. Send Email via NodeMailer
    await sendActivationEmail(request.email, request.clinic_name, keyCode);

    // 4. Update Request Status
    await supabase
      .from('clinic_requests')
      .update({ status: 'APPROVED' })
      .eq('id', id);

    res.status(200).json({ message: 'Request approved and email sent', activationKey: keyCode });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// System Admin: Reject a clinic request
// System Admin: Reject a clinic request
export const rejectClinicRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('clinic_requests')
      .update({ status: 'REJECTED' })
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ message: 'Clinic request rejected' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// System Admin: Update custom features for a clinic
export const updateClinicFeatures = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { custom_features } = req.body;

  try {
    const { data, error } = await supabase
      .from('clinics')
      .update({ custom_features })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Features updated successfully', clinic: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

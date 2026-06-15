import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getClinicSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', req.user.clinic_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is row not found
    
    // Return empty object if not found, since trigger might not have run
    res.status(200).json(data || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClinicSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const updateData = req.body;
  try {
    const { data, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotificationTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('type', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const upsertNotificationTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, name, content } = req.body;
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .upsert({ clinic_id: req.user.clinic_id, type, name, content }, { onConflict: 'type, name, clinic_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles:user_id(first_name, last_name, role)')
      .eq('clinic_id', req.user.clinic_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getClinics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Only SUPER_ADMIN can view all clinics' });
      return;
    }
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const upgradeSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan } = req.body;
  try {
    // In a real app, you would verify the Stripe/Razorpay payment intent here.
    // Since this is a mock flow, we just update the database directly.
    const validPlans = ['starter', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      res.status(400).json({ error: 'Invalid subscription plan' });
      return;
    }

    // Set expiry to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from('clinics')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_expiry: nextMonth.toISOString()
      })
      .eq('id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: 'Subscription upgraded successfully', clinic: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

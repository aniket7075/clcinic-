import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let query = supabase.from('notifications').select('*, clinics(name)');

    if (req.user.role === 'SUPER_ADMIN') {
      // Super admins see all notifications across all clinics
      query = query.or(`user_id.eq.${req.user.id},user_id.is.null`);
    } else {
      query = query
        .eq('clinic_id', req.user.clinic_id)
        .or(`user_id.eq.${req.user.id},user_id.is.null`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    let query = supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (req.user.role !== 'SUPER_ADMIN') {
      query = query.eq('clinic_id', req.user.clinic_id);
    }
    const { data, error } = await query.select().single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let query = supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    
    if (req.user.role === 'SUPER_ADMIN') {
      query = query.or(`user_id.eq.${req.user.id},user_id.is.null`);
    } else {
      query = query.eq('clinic_id', req.user.clinic_id).or(`user_id.eq.${req.user.id},user_id.is.null`);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    res.status(200).json({ message: 'All notifications marked as read', data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

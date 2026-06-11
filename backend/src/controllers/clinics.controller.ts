import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getClinics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createClinic = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, contact_email, contact_mobile, gst_number } = req.body;
  try {
    const { data, error } = await supabase
      .from('clinics')
      .insert([{ name, address, contact_email, contact_mobile, gst_number, is_active: true }])
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
  const { name, address, contact_email, contact_mobile, gst_number, is_active } = req.body;
  try {
    const { data, error } = await supabase
      .from('clinics')
      .update({ name, address, contact_email, contact_mobile, gst_number, is_active })
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

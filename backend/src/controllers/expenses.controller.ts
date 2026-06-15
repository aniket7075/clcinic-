import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, profiles:recorded_by(first_name, last_name)')
      .eq('clinic_id', req.user.clinic_id)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, description, expense_date } = req.body;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        clinic_id: req.user.clinic_id,
        category,
        amount,
        description,
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        recorded_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

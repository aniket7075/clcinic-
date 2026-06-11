import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('item_name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { unit_price, reorder_level, ...restBody } = req.body;
  const itemData = { ...restBody, clinic_id: req.user.clinic_id };
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([itemData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    const fs = require('fs');
    fs.appendFileSync('inventory_error.log', new Date().toISOString() + ': ' + (err.message || JSON.stringify(err)) + '\\n');
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { unit_price, reorder_level, ...updateData } = req.body;
  try {
    const { data, error } = await supabase
      .from('inventory')
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

export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    const lowStockItems = data.filter((item: any) => item.quantity <= item.low_stock_threshold);
    res.status(200).json(lowStockItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Suppliers ---
export const getSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('inventory_suppliers')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('name', { ascending: true });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  const supplierData = { ...req.body, clinic_id: req.user.clinic_id };
  try {
    const { data, error } = await supabase.from('inventory_suppliers').insert([supplierData]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Purchases ---
export const getPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('inventory_purchases')
      .select('*, inventory_suppliers(*), inventory(*)')
      .eq('clinic_id', req.user.clinic_id)
      .order('purchase_date', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  const { supplierId, itemId, quantity, cost, purchaseDate } = req.body;
  try {
    const { data, error } = await supabase
      .from('inventory_purchases')
      .insert([{ clinic_id: req.user.clinic_id, supplier_id: supplierId, item_id: itemId, quantity, cost, purchase_date: purchaseDate }])
      .select()
      .single();

    if (error) throw error;

    // Update stock quantity
    const { data: itemData } = await supabase.from('inventory').select('quantity').eq('id', itemId).eq('clinic_id', req.user.clinic_id).single();
    if (itemData) {
      await supabase.from('inventory').update({ quantity: itemData.quantity + quantity }).eq('id', itemId).eq('clinic_id', req.user.clinic_id);
    }

    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

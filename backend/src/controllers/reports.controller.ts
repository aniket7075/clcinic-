import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import PDFDocument from 'pdfkit';

export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  try {
    let query = supabase.from('payments').select('amount, payment_date').eq('clinic_id', req.user.clinic_id);
    if (startDate) query = query.gte('payment_date', startDate);
    if (endDate) query = query.lte('payment_date', endDate);

    const { data, error } = await query.order('payment_date', { ascending: true });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAppointmentsReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  try {
    let query = supabase.from('appointments').select('appointment_date, status').eq('clinic_id', req.user.clinic_id);
    if (startDate) query = query.gte('appointment_date', startDate);
    if (endDate) query = query.lte('appointment_date', endDate);

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInventoryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('item_name, category, quantity, unit, low_stock_threshold, expiry_date')
      .eq('clinic_id', req.user.clinic_id)
      .order('item_name', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const exportReportPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, startDate, endDate } = req.query; // type: 'revenue', 'appointments'
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-disposition', `attachment; filename=${type}-report-${startDate}-to-${endDate}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text(`Clinic ${type?.toString().toUpperCase()} Report`, { align: 'center' });
    doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown(2);

    if (type === 'revenue') {
      let query = supabase.from('payments').select('amount, payment_date, payment_method, invoices(invoice_number)').eq('clinic_id', req.user.clinic_id);
      if (startDate) query = query.gte('payment_date', startDate);
      if (endDate) query = query.lte('payment_date', endDate);
      const { data } = await query.order('payment_date', { ascending: true });

      let total = 0;
      data?.forEach((p: any) => {
        doc.text(`${new Date(p.payment_date).toLocaleDateString()} - Invoice ${p.invoices?.invoice_number} - ${p.payment_method} - Rs.${p.amount}`);
        total += Number(p.amount);
      });
      doc.moveDown();
      doc.font('Helvetica-Bold').text(`Total Revenue: Rs.${total}`);
    } else if (type === 'appointments') {
      let query = supabase.from('appointments').select('appointment_date, status, patients(first_name, last_name)').eq('clinic_id', req.user.clinic_id);
      if (startDate) query = query.gte('appointment_date', startDate);
      if (endDate) query = query.lte('appointment_date', endDate);
      const { data } = await query.order('appointment_date', { ascending: true });

      let total = data?.length || 0;
      data?.forEach((a: any) => {
        doc.text(`${a.appointment_date} - ${a.patients?.first_name} ${a.patients?.last_name} - ${a.status}`);
      });
      doc.moveDown();
      doc.font('Helvetica-Bold').text(`Total Appointments: ${total}`);
    }

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

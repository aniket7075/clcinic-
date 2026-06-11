import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import PDFDocument from 'pdfkit';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, patients(first_name, last_name, case_number)')
      .eq('clinic_id', req.user.clinic_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, patients(*), invoice_items(*), payments(*)')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const { patient_id, appointment_id, discount, tax, items } = req.body;
  try {
    // Calculate total amount from items
    const total_amount = items.reduce((acc: number, item: any) => acc + Number(item.charge), 0);
    const final_amount = total_amount - Number(discount || 0) + Number(tax || 0);

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([{ clinic_id: req.user.clinic_id, patient_id, appointment_id, total_amount, discount, tax, final_amount }])
      .select()
      .single();

    if (error) throw error;

    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        invoice_id: invoice.id,
        treatment_name: item.service_name || item.treatment_name,
        charge: item.charge
      }));
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }

    res.status(201).json(invoice);
  } catch (err: any) {
    console.error('Create Invoice Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, payment_method, received_by } = req.body;

  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{ clinic_id: req.user.clinic_id, invoice_id: id, amount, payment_method, received_by }])
      .select()
      .single();

    if (error) throw error;

    // Recalculate status
    const { data: invoice } = await supabase.from('invoices').select('final_amount').eq('id', id).eq('clinic_id', req.user.clinic_id).single();
    const { data: payments } = await supabase.from('payments').select('amount').eq('invoice_id', id).eq('clinic_id', req.user.clinic_id);
    
    if (invoice && payments) {
      const totalPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
      let newStatus = 'PENDING';
      if (totalPaid >= invoice.final_amount) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PARTIAL';
      }

      await supabase.from('invoices').update({ status: newStatus }).eq('id', id).eq('clinic_id', req.user.clinic_id);
    }

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const generateInvoicePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, patients(*), invoice_items(*)')
      .eq('id', id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error || !invoice) throw new Error('Invoice not found');

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-disposition', `attachment; filename=Invoice-${invoice.invoice_number}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Dental Clinic', { align: 'center' });
    doc.fontSize(10).text('123 Main Street, City', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Patient & Invoice Details
    doc.fontSize(10).text(`Invoice Number: ${invoice.invoice_number}`);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`);
    doc.text(`Patient Name: ${invoice.patients.first_name} ${invoice.patients.last_name}`);
    doc.text(`Case Number: ${invoice.patients.case_number}`);
    doc.moveDown();

    // Items
    doc.text('Treatments / Services:', { underline: true });
    doc.moveDown(0.5);
    invoice.invoice_items.forEach((item: any) => {
      doc.text(`${item.treatment_name} - Rs.${item.charge}`);
    });
    doc.moveDown();

    // Totals
    doc.text(`Total Amount: Rs.${invoice.total_amount}`);
    doc.text(`Discount: Rs.${invoice.discount}`);
    doc.text(`Tax: Rs.${invoice.tax}`);
    doc.font('Helvetica-Bold').fontSize(12).text(`Final Amount: Rs.${invoice.final_amount}`);

    doc.end();

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

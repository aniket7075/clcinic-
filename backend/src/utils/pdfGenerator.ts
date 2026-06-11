import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generatePrescriptionPDF = (res: Response, prescriptionData: any, patientData: any, clinicData: any) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=prescription_${patientData.case_number}.pdf`);

  doc.pipe(res);

  // Header (Clinic Info)
  doc.fontSize(20).fillColor('#005bbb').text(clinicData?.name || 'Dental Clinic Pro', { align: 'center' });
  doc.fontSize(10).fillColor('#475569').text(clinicData?.address || '123 Main St, City', { align: 'center' });
  doc.text(`Phone: ${clinicData?.contact_mobile || '555-0100'} | Email: ${clinicData?.contact_email || 'contact@clinic.com'}`, { align: 'center' });
  
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').stroke();
  doc.moveDown(1);

  // Patient Info
  doc.fontSize(14).fillColor('#0f172a').text('PRESCRIPTION', { align: 'center', underline: true });
  doc.moveDown(1);

  const patientDetailsY = doc.y;
  doc.fontSize(10).fillColor('#334155');
  doc.text(`Patient Name: ${patientData.first_name} ${patientData.last_name}`, 50, patientDetailsY);
  doc.text(`Age/Gender: ${patientData.age || 'N/A'} / ${patientData.gender || 'N/A'}`, 50, patientDetailsY + 15);
  doc.text(`Case No: ${patientData.case_number}`, 50, patientDetailsY + 30);
  
  doc.text(`Date: ${new Date(prescriptionData.prescription_date).toLocaleDateString()}`, 350, patientDetailsY);
  doc.text(`Doctor: Dr. ${prescriptionData.doctor?.last_name || 'N/A'}`, 350, patientDetailsY + 15);

  doc.moveDown(3);

  // Rx Symbol
  doc.fontSize(24).fillColor('#005bbb').text('Rx', 50, doc.y);
  doc.moveDown(1);

  // Medicines
  if (prescriptionData.prescription_items && prescriptionData.prescription_items.length > 0) {
    let currentY = doc.y;
    
    // Table Header
    doc.fontSize(10).fillColor('#64748b');
    doc.text('Medicine', 50, currentY, { width: 200 });
    doc.text('Dosage', 250, currentY, { width: 150 });
    doc.text('Duration', 400, currentY, { width: 100 });
    
    currentY += 15;
    doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor('#e2e8f0').stroke();
    currentY += 10;

    doc.fillColor('#0f172a');
    prescriptionData.prescription_items.forEach((item: any, index: number) => {
      doc.text(`${index + 1}. ${item.medicine}`, 50, currentY, { width: 200 });
      doc.text(item.dosage, 250, currentY, { width: 150 });
      doc.text(item.duration, 400, currentY, { width: 100 });
      currentY += 20;
    });
    
    doc.y = currentY;
  } else {
    doc.fontSize(10).fillColor('#64748b').text('No medicines prescribed.', 50, doc.y);
  }

  doc.moveDown(2);

  // Instructions
  if (prescriptionData.instructions) {
    doc.fontSize(12).fillColor('#005bbb').text('Special Instructions:');
    doc.fontSize(10).fillColor('#334155').text(prescriptionData.instructions);
  }

  // Footer
  doc.moveDown(4);
  const signatureY = doc.y;
  doc.moveTo(400, signatureY).lineTo(550, signatureY).strokeColor('#94a3b8').stroke();
  doc.fontSize(10).fillColor('#64748b').text('Doctor\'s Signature', 400, signatureY + 5, { width: 150, align: 'center' });

  // Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).text(
      `Page ${i + 1} of ${pages.count}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );
  }

  doc.end();
};

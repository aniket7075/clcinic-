import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'invoices' | 'pending'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    discount: 0,
    tax: 0,
    items: [{ service_name: '', quantity: 1, unit_price: 0, charge: 0 }]
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing');
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.patients || res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await api.get(`/billing/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].charge = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service_name: '', quantity: 1, unit_price: 0, charge: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/billing', formData);
      setShowModal(false);
      setFormData({
        patient_id: '', discount: 0, tax: 0, 
        items: [{ service_name: '', quantity: 1, unit_price: 0, charge: 0 }]
      });
      fetchInvoices();
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID');
  const displayInvoices = activeTab === 'invoices' ? invoices : pendingInvoices;

  const totalAmount = formData.items.reduce((acc, item) => acc + item.charge, 0);
  const finalAmount = totalAmount - formData.discount + formData.tax;

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('billing.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('billing.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-all font-semibold shadow-sm"
        >
          <Plus size={18} />
          {t('billing.newInvoice')}
        </button>
      </div>

      <div className="flex space-x-6 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 font-semibold transition-colors ${
            activeTab === 'invoices' ? 'border-b-2 border-[#6899B0] text-[#6899B0]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('billing.allInvoices')}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'pending' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t('billing.pendingDues')}
          {pendingInvoices.length > 0 && (
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">{pendingInvoices.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6899B0]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">{t('billing.invoiceNo')}</th>
                <th className="p-4 font-bold">{t('billing.date')}</th>
                <th className="p-4 font-bold">{t('billing.patient')}</th>
                <th className="p-4 font-bold">{t('billing.amount')}</th>
                <th className="p-4 font-bold">{t('billing.status')}</th>
                <th className="p-4 font-bold text-right">{t('billing.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{inv.invoice_number}</td>
                  <td className="p-4 text-slate-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-700 font-medium">{inv.patients?.first_name} {inv.patients?.last_name}</td>
                  <td className="p-4 font-bold text-slate-900">₹{inv.final_amount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider ${
                      inv.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-200' :
                      inv.status === 'PARTIAL' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleDownloadPDF(inv.id)}
                      title="Download PDF"
                      className="p-2 text-slate-600 hover:text-[#6899B0] hover:bg-[#6899B0]/10 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {displayInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-slate-300 mb-4" />
                      <p>{t('billing.noInvoices')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{t('billing.createInvoice')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">{t('billing.patient')}</label>
                <select 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">{t('billing.selectPatient')}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">{t('billing.servicesItems')}</label>
                  <button type="button" onClick={addItem} className="text-sm text-[#6899B0] font-medium hover:text-[#5D8799] flex items-center gap-1">
                    <Plus size={14} /> {t('billing.addItem')}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <input 
                        required 
                        list="dental-services"
                        type="text" 
                        placeholder={t('billing.serviceName')}
                        className="flex-1 p-2 border rounded text-sm outline-none"
                        value={item.service_name}
                        onChange={e => handleItemChange(index, 'service_name', e.target.value)}
                      />
                      <input 
                        required 
                        type="number" 
                        placeholder={t('billing.qty')}
                        min="1"
                        className="w-20 p-2 border rounded text-sm outline-none"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      />
                      <input 
                        required 
                        type="number" 
                        placeholder={t('billing.price')}
                        min="0"
                        className="w-24 p-2 border rounded text-sm outline-none"
                        value={item.unit_price}
                        onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                      />
                      <div className="w-20 text-right font-medium text-sm">₹{item.charge}</div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)} 
                        className="p-2 text-red-400 hover:text-red-600"
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <datalist id="dental-services">
                  <option value="Consultation" />
                  <option value="Root Canal Treatment (RCT)" />
                  <option value="Re-RCT (Retreatment)" />
                  <option value="Tooth Extraction (Simple)" />
                  <option value="Tooth Extraction (Surgical/Impaction)" />
                  <option value="Dental Crown (PFM)" />
                  <option value="Dental Crown (Zirconia/E-max)" />
                  <option value="Dental Bridge (PFM/Zirconia)" />
                  <option value="Dental Implant Placement" />
                  <option value="Implant Crown/Prosthesis" />
                  <option value="Teeth Cleaning / Scaling & Polishing" />
                  <option value="Deep Scaling / Root Planing" />
                  <option value="Teeth Whitening / Bleaching" />
                  <option value="Dental Filling (Composite)" />
                  <option value="Dental Filling (GIC / Amalgam)" />
                  <option value="Orthodontic Braces (Metal)" />
                  <option value="Orthodontic Braces (Ceramic)" />
                  <option value="Clear Aligners" />
                  <option value="Complete Denture" />
                  <option value="Removable Partial Denture (RPD)" />
                  <option value="Cast Partial Denture (CPD)" />
                  <option value="Veneers / Laminates" />
                  <option value="Fluoride Treatment" />
                  <option value="Pit and Fissure Sealants" />
                  <option value="Pulpectomy (Kids)" />
                  <option value="Stainless Steel Crown (Kids)" />
                  <option value="Periodontal Flap Surgery" />
                  <option value="Gingivectomy / Gingivoplasty" />
                  <option value="Bone Grafting" />
                  <option value="Night Guard / Splint" />
                  <option value="X-Ray (IOPA)" />
                  <option value="X-Ray (OPG)" />
                  <option value="CBCT Scan" />
                </datalist>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">{t('billing.subtotal')}</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">{t('billing.discount')}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-24 p-1 border rounded text-right outline-none"
                    value={formData.discount}
                    onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">{t('billing.tax')}</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-24 p-1 border rounded text-right outline-none"
                    value={formData.tax}
                    onChange={e => setFormData({...formData, tax: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
                  <span>{t('billing.totalAmount')}</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">{t('billing.cancel')}</button>
                <button type="submit" disabled={submitting || finalAmount < 0} className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50">
                  {submitting ? t('billing.saving') : t('billing.createBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

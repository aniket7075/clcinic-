import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';

const Billing: React.FC = () => {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Billing & Revenue</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors"
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'invoices' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-black hover:text-black'
          }`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'pending' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-black hover:text-black'
          }`}
        >
          Pending Dues
          {pendingInvoices.length > 0 && (
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{pendingInvoices.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-black">Loading billing data...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium text-black">{inv.invoice_number}</td>
                  <td className="p-4 text-black">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-4">{inv.patients?.first_name} {inv.patients?.last_name}</td>
                  <td className="p-4 font-semibold text-black">₹{inv.final_amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      inv.status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleDownloadPDF(inv.id)}
                      className="p-1.5 text-black hover:text-[#6899B0] bg-slate-100 hover:bg-[#E0EEF5] rounded transition-colors"
                      title="Download PDF"
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
                      <p>No invoices found in this view.</p>
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
            <h2 className="text-xl font-bold mb-6">Create New Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <select 
                  required 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none"
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Services & Items</label>
                  <button type="button" onClick={addItem} className="text-sm text-[#6899B0] font-medium hover:text-[#5D8799] flex items-center gap-1">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                      <input 
                        required 
                        type="text" 
                        placeholder="Service name..."
                        className="flex-1 p-2 border rounded text-sm outline-none"
                        value={item.service_name}
                        onChange={e => handleItemChange(index, 'service_name', e.target.value)}
                      />
                      <input 
                        required 
                        type="number" 
                        placeholder="Qty"
                        min="1"
                        className="w-20 p-2 border rounded text-sm outline-none"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      />
                      <input 
                        required 
                        type="number" 
                        placeholder="Price"
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
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Subtotal:</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Discount (₹):</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-24 p-1 border rounded text-right outline-none"
                    value={formData.discount}
                    onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black">Tax (₹):</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-24 p-1 border rounded text-right outline-none"
                    value={formData.tax}
                    onChange={e => setFormData({...formData, tax: Number(e.target.value)})}
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting || finalAmount < 0} className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Create Invoice'}
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

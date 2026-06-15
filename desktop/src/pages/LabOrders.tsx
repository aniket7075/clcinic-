import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Beaker, Plus } from 'lucide-react';

const LabOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  const [form, setForm] = useState({
    patient_id: '',
    lab_name: '',
    work_description: '',
    tooth_number: '',
    shade: '',
    sent_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    cost: 0
  });

  const fetchOrders = async () => {
    try {
      const res = await api.get('/treatments/lab-orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.patients || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/treatments/lab-orders', { ...form, status: 'SENT' });
      setShowModal(false);
      setForm({
        patient_id: '', lab_name: '', work_description: '',
        tooth_number: '', shade: '', sent_date: new Date().toISOString().split('T')[0],
        expected_date: '', cost: 0
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Error creating lab order');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/treatments/lab-orders/${id}`, { 
        status, 
        received_date: status === 'RECEIVED' ? new Date().toISOString().split('T')[0] : null 
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <Beaker className="text-[#6899B0]" /> Lab Orders Tracking
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors font-medium"
        >
          <Plus size={18} /> New Lab Order
        </button>
      </div>

      {loading ? (
        <p className="text-black">Loading lab orders...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm uppercase tracking-wider font-semibold">
                <th className="p-4">Date Sent</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Lab Name</th>
                <th className="p-4">Work Detail</th>
                <th className="p-4">Expected</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 text-sm">{new Date(order.sent_date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-black">{order.patient?.first_name} {order.patient?.last_name}</td>
                  <td className="p-4 text-sm font-medium">{order.lab_name}</td>
                  <td className="p-4 text-sm">
                    <p>{order.work_description}</p>
                    {(order.tooth_number || order.shade) && (
                      <p className="text-xs text-slate-500 mt-1">Tooth: {order.tooth_number || '-'} | Shade: {order.shade || '-'}</p>
                    )}
                  </td>
                  <td className="p-4 text-sm">{order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '-'}</td>
                  <td className="p-4 text-sm font-bold">₹{order.cost}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      order.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                      order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs p-1.5 border rounded outline-none font-medium cursor-pointer"
                    >
                      <option value="SENT">SENT</option>
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <Beaker size={48} className="mx-auto text-slate-300 mb-4" />
                    No lab orders tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-[#6899B0]" /> Create Lab Order
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient</label>
                  <select required className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lab Name</label>
                  <input required type="text" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.lab_name} onChange={e => setForm({...form, lab_name: e.target.value})} placeholder="e.g. Modern Dental Lab" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Work Description</label>
                <input required type="text" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.work_description} onChange={e => setForm({...form, work_description: e.target.value})} placeholder="e.g. PFM Crown" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tooth Number(s)</label>
                  <input type="text" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.tooth_number} onChange={e => setForm({...form, tooth_number: e.target.value})} placeholder="e.g. 14, 15" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shade</label>
                  <input type="text" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.shade} onChange={e => setForm({...form, shade: e.target.value})} placeholder="e.g. A2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sent Date</label>
                  <input required type="date" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.sent_date} onChange={e => setForm({...form, sent_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Return Date</label>
                  <input required type="date" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.expected_date} onChange={e => setForm({...form, expected_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Cost (₹)</label>
                  <input required type="number" min="0" className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#6899B0]" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabOrders;

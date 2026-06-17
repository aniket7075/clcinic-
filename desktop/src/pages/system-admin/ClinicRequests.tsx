import React, { useState, useEffect } from 'react';
import { Check, X, Building2, Calendar, Mail, Phone } from 'lucide-react';

import api from '../../api/axios';

interface ClinicRequest {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ClinicRequests: React.FC = () => {
  const [requests, setRequests] = useState<ClinicRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedReq, setSelectedReq] = useState<ClinicRequest | null>(null);
  const [approvalData, setApprovalData] = useState({
    plan: 'PRO',
    duration_days: '30',
    features: [] as string[]
  });

  const availableFeatures = [
    { id: 'LAB_ORDERS', label: 'Lab Orders' },
    { id: 'EXPENSES', label: 'Expenses' },
    { id: 'INVENTORY', label: 'Inventory' },
    { id: 'AUDIT_LOGS', label: 'Audit Logs' },
    { id: 'STAFF', label: 'Staff Management' }
  ];

  const fetchRequests = async () => {
    try {
      const res = await api.get('/clinics/requests');
      setRequests(res.data.map((r: any) => ({
        id: r.id,
        name: r.clinic_name,
        ownerName: r.owner_name,
        email: r.email,
        phone: r.phone,
        plan: r.plan,
        date: new Date(r.created_at).toLocaleDateString(),
        status: r.status.toLowerCase()
      })));
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openApproveModal = (req: ClinicRequest) => {
    setSelectedReq(req);
    setApprovalData({
      plan: req.plan || 'PRO',
      duration_days: '30',
      features: []
    });
  };

  const handleFeatureToggle = (featId: string) => {
    setApprovalData(prev => {
      if (prev.features.includes(featId)) {
        return { ...prev, features: prev.features.filter(f => f !== featId) };
      } else {
        return { ...prev, features: [...prev.features, featId] };
      }
    });
  };

  const handleConfirmApprove = async () => {
    if (!selectedReq) return;
    try {
      await api.post(`/clinics/requests/${selectedReq.id}/approve`, approvalData);
      fetchRequests();
      setSelectedReq(null);
      alert('Clinic approved with custom key and email sent!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await api.post(`/clinics/requests/${id}/reject`);
      fetchRequests();
      alert('Clinic request rejected.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-sm text-slate-500">Review and approve new clinic registrations to grant them software access.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading requests...</div>
          ) : requests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No pending requests at the moment.
            </div>
          ) : (
            requests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row gap-6 justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{req.name}</h3>
                      <p className="text-sm font-medium text-slate-500">{req.ownerName}</p>
                    </div>
                    <span className="ml-4 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
                      {req.plan} Plan
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ml-13">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={16} className="text-slate-400" /> {req.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" /> {req.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" /> Applied: {req.date}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                  >
                    <X size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => openApproveModal(req)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                  >
                    <Check size={18} /> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Approval Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Approve & Generate License</h2>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                You are approving <strong>{selectedReq.name}</strong>. An email with the activation key will be sent automatically.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign Plan</label>
                  <select 
                    value={approvalData.plan}
                    onChange={e => setApprovalData({...approvalData, plan: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Days)</label>
                  <input 
                    type="number" 
                    value={approvalData.duration_days}
                    onChange={e => setApprovalData({...approvalData, duration_days: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 2, 30, 365"
                  />
                  <p className="text-xs text-slate-500 mt-1">Set to 2 for a 2-day trial</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Manual Feature Overrides</label>
                <p className="text-xs text-slate-500 mb-3">Grant specific extra features regardless of the chosen plan.</p>
                <div className="grid grid-cols-2 gap-3">
                  {availableFeatures.map(feat => (
                    <label key={feat.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        checked={approvalData.features.includes(feat.id)}
                        onChange={() => handleFeatureToggle(feat.id)}
                      />
                      <span className="text-sm font-medium text-slate-700">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button 
                onClick={() => setSelectedReq(null)}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmApprove}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Confirm & Send Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ClinicRequests;

import React, { useState, useEffect } from 'react';
import { Building2, Settings, X, RefreshCw, Trash2, Edit, Plus } from 'lucide-react';
import api from '../../api/axios';

interface Clinic {
  id: string;
  name: string;
  contact_email: string;
  contact_mobile: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expiry: string;
  custom_features: string[];
  profiles?: {
    first_name: string;
    last_name: string;
    role: string;
  }[];
}

const availableFeatures = [
  { id: 'LAB_ORDERS', label: 'Lab Orders' },
  { id: 'EXPENSES', label: 'Expenses' },
  { id: 'INVENTORY', label: 'Inventory' },
  { id: 'AUDIT_LOGS', label: 'Audit Logs' },
  { id: 'STAFF', label: 'Staff Management' }
];

const AllClinics: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<string[]>([]);
  const [renewingClinic, setRenewingClinic] = useState<Clinic | null>(null);
  const [renewalData, setRenewalData] = useState({ plan: 'PRO', duration_days: 30 });
  const [saving, setSaving] = useState(false);

  // Edit / Add States
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [addingClinic, setAddingClinic] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_email: '', contact_mobile: '', plan: 'PRO' });

  const fetchClinics = async () => {
    try {
      const res = await api.get('/clinics');
      setClinics(res.data);
    } catch (error) {
      console.error('Failed to fetch clinics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleOpenFeatures = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setEditingFeatures(clinic.custom_features || []);
  };

  const handleToggleFeature = (featId: string) => {
    if (editingFeatures.includes(featId)) {
      setEditingFeatures(editingFeatures.filter(f => f !== featId));
    } else {
      setEditingFeatures([...editingFeatures, featId]);
    }
  };

  const handleSaveFeatures = async () => {
    if (!selectedClinic) return;
    setSaving(true);
    try {
      await api.patch(`/clinics/${selectedClinic.id}/features`, { custom_features: editingFeatures });
      fetchClinics();
      setSelectedClinic(null);
    } catch (error) {
      console.error('Failed to update features', error);
      alert('Failed to update features.');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async () => {
    if (!renewingClinic) return;
    setSaving(true);
    try {
      const expiryDate = new Date(Date.now() + renewalData.duration_days * 24 * 60 * 60 * 1000);
      await api.put(`/clinics/${renewingClinic.id}`, {
        subscription_plan: renewalData.plan,
        subscription_expiry: expiryDate.toISOString(),
        subscription_status: 'ACTIVE',
        is_active: true
      });
      fetchClinics();
      setRenewingClinic(null);
      alert('Clinic subscription successfully renewed!');
    } catch (error) {
      console.error('Failed to renew clinic', error);
      alert('Failed to renew clinic.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clinic: Clinic) => {
    if (window.confirm(`Are you sure you want to completely remove ${clinic.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/clinics/${clinic.id}`);
        fetchClinics();
        alert('Clinic successfully removed.');
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete clinic.');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic) return;
    setSaving(true);
    try {
      await api.put(`/clinics/${editingClinic.id}`, {
        name: formData.name,
        contact_email: formData.contact_email,
        contact_mobile: formData.contact_mobile
      });
      setEditingClinic(null);
      fetchClinics();
      alert('Clinic details updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update clinic');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Create a direct request, so the admin can just go to Requests and approve it
      await api.post('/public/register-clinic', {
        clinic_name: formData.name,
        owner_name: 'Admin Added',
        email: formData.contact_email,
        phone: formData.contact_mobile,
        plan: formData.plan,
        billing_cycle: 'monthly'
      });
      setAddingClinic(false);
      alert('Clinic added to Requests! Please go to the "Requests" tab to approve it and send the activation key.');
    } catch (err) {
      console.error(err);
      alert('Failed to add clinic request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Clinics</h2>
            <p className="text-sm text-slate-500">Manage all approved clinics and their subscription statuses.</p>
          </div>
          <button 
            onClick={() => { setAddingClinic(true); setFormData({ name: '', contact_email: '', contact_mobile: '', plan: 'PRO' }); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus size={16} /> Add Clinic Manually
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading clinics...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-slate-900">{clinic.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">
                        {clinic.profiles?.find(p => p.role === 'CLINIC_ADMIN')?.first_name || 'N/A'} {clinic.profiles?.find(p => p.role === 'CLINIC_ADMIN')?.last_name || ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">{clinic.contact_email}</div>
                      <div className="text-xs text-slate-500">{clinic.contact_mobile}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {clinic.subscription_plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold w-max ${clinic.subscription_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {clinic.subscription_status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Exp: {new Date(clinic.subscription_expiry).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap w-max">
                        <button 
                          onClick={() => { setRenewingClinic(clinic); setRenewalData({ plan: clinic.subscription_plan, duration_days: 30 }); }}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" 
                          title="Renew / Reactivate"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenFeatures(clinic)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                          title="Manage Features"
                        >
                          <Settings size={18} />
                        </button>
                        <button 
                          onClick={() => { setEditingClinic(clinic); setFormData({ name: clinic.name, contact_email: clinic.contact_email, contact_mobile: clinic.contact_mobile, plan: clinic.subscription_plan }); }}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" 
                          title="Edit Clinic"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(clinic)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="Remove Clinic"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Feature Override Modal */}
      {selectedClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Custom Features</h2>
              <button onClick={() => setSelectedClinic(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Toggle custom features for <strong>{selectedClinic.name}</strong>. These features will be accessible regardless of their current plan ({selectedClinic.subscription_plan}).
              </p>

              <div className="space-y-3">
                {availableFeatures.map(feat => (
                  <label key={feat.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={editingFeatures.includes(feat.id)}
                      onChange={() => handleToggleFeature(feat.id)}
                    />
                    <span className="text-sm font-medium text-slate-700">{feat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button 
                onClick={() => setSelectedClinic(null)}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveFeatures}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Features'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Renewal Modal */}
      {renewingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Manual Renewal</h2>
              <button onClick={() => setRenewingClinic(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Renew subscription for <strong>{renewingClinic.name}</strong>. Use this when payment is collected offline (e.g., Cash or direct UPI).
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Plan</label>
                <select 
                  value={renewalData.plan}
                  onChange={e => setRenewalData({...renewalData, plan: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
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
                  value={renewalData.duration_days}
                  onChange={e => setRenewalData({...renewalData, duration_days: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button 
                onClick={() => setRenewingClinic(null)}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRenew}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Renew'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Clinic Modal */}
      {(editingClinic || addingClinic) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{editingClinic ? 'Edit Clinic Details' : 'Manually Add Clinic'}</h2>
              <button onClick={() => { setEditingClinic(null); setAddingClinic(false); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={editingClinic ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Clinic Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.contact_email}
                  onChange={e => setFormData({...formData, contact_email: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.contact_mobile}
                  onChange={e => setFormData({...formData, contact_mobile: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {addingClinic && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign Plan</label>
                  <select 
                    value={formData.plan}
                    onChange={e => setFormData({...formData, plan: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setEditingClinic(null); setAddingClinic(false); }}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingClinic ? 'Update' : 'Add Clinic')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AllClinics;

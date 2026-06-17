import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Building2, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

const ManageClinics: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editingClinic, setEditingClinic] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_mobile: '',
    gst_number: '',
    is_active: true,
    subscription_status: 'TRIAL',
    subscription_expiry: ''
  });

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchClinics();
  }, [user, navigate]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clinics');
      setClinics(res.data);
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError(err.response?.data?.error || 'Failed to fetch clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (clinic?: any) => {
    if (clinic) {
      setEditingClinic(clinic);
      setFormData({
        name: clinic.name || '',
        address: clinic.address || '',
        contact_email: clinic.contact_email || '',
        contact_mobile: clinic.contact_mobile || '',
        gst_number: clinic.gst_number || '',
        is_active: clinic.is_active,
        subscription_status: clinic.subscription_status || 'TRIAL',
        subscription_expiry: clinic.subscription_expiry || ''
      });
    } else {
      setEditingClinic(null);
      setFormData({
        name: '',
        address: '',
        contact_email: '',
        contact_mobile: '',
        gst_number: '',
        is_active: true,
        subscription_status: 'TRIAL',
        subscription_expiry: ''
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClinic(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Clinic Name is required');
      return;
    }

    try {
      if (editingClinic) {
        await api.put(`/clinics/${editingClinic.id}`, formData);
      } else {
        await api.post('/clinics', formData);
      }
      handleCloseModal();
      fetchClinics();
    } catch (err: any) {
      console.error('Error saving clinic:', err);
      setError(err.response?.data?.error || 'Failed to save clinic');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the clinic "${name}"?\nIf it has existing data, it will be deactivated instead.`)) return;

    try {
      const res = await api.delete(`/clinics/${id}`);
      if (res.data.message) {
        alert(res.data.message);
      }
      fetchClinics();
    } catch (err: any) {
      console.error('Error deleting clinic:', err);
      alert(err.response?.data?.error || 'Failed to delete clinic');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6899B0] to-[#85B2C6] tracking-tight">Manage Clinics</h1>
          <p className="text-black mt-2 font-medium">Add, update, or remove clinics from the system.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#6899B0] to-[#85B2C6] hover:from-[#6899B0] hover:to-[#6899B0] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#6899B0]/30 hover:shadow-xl hover:shadow-[#6899B0]/40 hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={2.5} />
          Add Clinic
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6899B0]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-[#E0EEF5] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E0EEF5] border-b border-[#B8D4E3] text-[#6899B0] text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Clinic Name</th>
                <th className="p-5 font-bold">Address</th>
                <th className="p-5 font-bold">Contact Info</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="border-b border-[#E0EEF5]/50 hover:bg-[#E0EEF5]/30 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A4C8D8] to-[#B8D4E3] flex items-center justify-center text-[#6899B0] shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-[#6899B0] text-base">{clinic.name}</p>
                        {clinic.gst_number && <p className="text-xs text-[#85B2C6] mt-0.5 font-medium">GST: {clinic.gst_number}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-[#6899B0] max-w-xs truncate font-medium" title={clinic.address}>
                    {clinic.address || '-'}
                  </td>
                  <td className="p-5 text-sm font-medium">
                    {clinic.contact_email && <div className="text-[#6899B0]">{clinic.contact_email}</div>}
                    {clinic.contact_mobile && <div className="text-[#85B2C6] mt-0.5">{clinic.contact_mobile}</div>}
                    {!clinic.contact_email && !clinic.contact_mobile && '-'}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${clinic.is_active ? 'bg-[#B8D4E3]/40 text-[#6899B0] border border-[#B8D4E3]' : 'bg-slate-100 text-black border border-slate-200'}`}>
                        {clinic.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${clinic.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : clinic.subscription_status === 'TRIAL' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {clinic.subscription_status || 'TRIAL'}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(clinic)}
                        className="p-2.5 text-[#85B2C6] hover:text-[#6899B0] hover:bg-[#E0EEF5] rounded-xl transition-all"
                        title="Edit Clinic"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(clinic.id, clinic.name)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Clinic"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clinics.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black">
                    No clinics found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#6899B0]/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all border border-[#E0EEF5]">
            <div className="p-6 border-b border-[#E0EEF5] flex justify-between items-center bg-[#E0EEF5]/30 shrink-0">
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6899B0] to-[#85B2C6] flex items-center gap-3">
                <div className="p-2 bg-[#E0EEF5] rounded-lg text-[#6899B0]">
                  <Building2 size={24} />
                </div>
                {editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-black hover:bg-slate-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <form id="clinic-form" onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                    placeholder="E.g., Downtown Dental Care"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] min-h-[80px] transition-all font-medium text-[#6899B0]"
                    placeholder="Full clinic address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                      placeholder="contact@clinic.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contact_mobile}
                      onChange={(e) => setFormData({...formData, contact_mobile: e.target.value})}
                      className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#6899B0] mb-1.5">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                    className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                    placeholder="Enter GST number"
                  />
                </div>

                {editingClinic && (
                  <>
                    <div className="grid grid-cols-2 gap-5 pt-4 border-t border-[#E0EEF5]">
                      <div>
                        <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Subscription Status</label>
                        <select
                          value={formData.subscription_status}
                          onChange={(e) => setFormData({...formData, subscription_status: e.target.value})}
                          className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                        >
                          <option value="TRIAL">Trial</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6899B0] mb-1.5">Expiry Date</label>
                        <input
                          type="date"
                          value={formData.subscription_expiry ? new Date(formData.subscription_expiry).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({...formData, subscription_expiry: e.target.value})}
                          className="w-full px-4 py-3 bg-[#E0EEF5]/20 border border-[#B8D4E3] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6899B0] focus:border-[#6899B0] transition-all font-medium text-[#6899B0]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingClinic && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded border-[#B8D4E3] text-[#6899B0] focus:ring-[#6899B0]"
                    />
                      <label htmlFor="is_active" className="text-sm text-[#6899B0] font-bold">Clinic is Active</label>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-[#E0EEF5] bg-[#E0EEF5]/10 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 text-[#6899B0] hover:bg-[#E0EEF5] rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="clinic-form"
                className="px-6 py-2.5 bg-gradient-to-r from-[#6899B0] to-[#85B2C6] hover:from-[#6899B0] hover:to-[#6899B0] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#6899B0]/30 hover:shadow-xl hover:shadow-[#6899B0]/40 hover:-translate-y-0.5"
              >
                {editingClinic ? 'Update Clinic' : 'Create Clinic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClinics;

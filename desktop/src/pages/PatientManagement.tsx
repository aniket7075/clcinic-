import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search } from 'lucide-react';

interface Patient {
  id: string;
  case_number: string;
  first_name: string;
  last_name: string;
  mobile: string;
  gender: string;
  dob: string;
  age: number;
}

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    gender: 'Male',
    dob: '',
  });

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/patients/search?query=${encodeURIComponent(query)}` : '/patients';
      const res = await api.get(endpoint);
      setPatients(res.data.patients || res.data); // Handle both wrapped and unwrapped array
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(searchQuery);
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/patients', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile: formData.mobile,
        gender: formData.gender,
        dob: formData.dob,
      });
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', mobile: '', gender: 'Male', dob: '' });
      fetchPatients();
    } catch (err) {
      console.error('Error creating patient:', err);
      alert('Error creating patient');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Patient Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]"
        >
          <Plus size={18} />
          Add Patient
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, or case number..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6899B0]"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
                <th className="p-4">Case Number</th>
                <th className="p-4">Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Age/Gender</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-medium text-black">{patient.case_number}</td>
                  <td className="p-4">{patient.first_name} {patient.last_name}</td>
                  <td className="p-4 text-black">{patient.mobile}</td>
                  <td className="p-4 text-black">{patient.age} / {patient.gender}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="text-[#6899B0] hover:text-[#5D8799] font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Register New Patient</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input required className="w-full border p-2 rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input required className="w-full border p-2 rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile</label>
                  <input required className="w-full border p-2 rounded" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={formData.dob} max={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="w-full border p-2 rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Activity, Users as UsersIcon, Download } from 'lucide-react';

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

  const exportToCSV = () => {
    if (patients.length === 0) {
      alert('No patients to export');
      return;
    }

    const headers = ['Case Number', 'First Name', 'Last Name', 'Mobile', 'Gender', 'Date of Birth', 'Age'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    patients.forEach(patient => {
      const values = [
        patient.case_number,
        patient.first_name,
        patient.last_name,
        patient.mobile,
        patient.gender,
        patient.dob || 'N/A',
        patient.age || 'N/A'
      ];
      // Escape commas and quotes
      const escapedValues = values.map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(escapedValues.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patients_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage your clinic's patient registry.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold transition-all shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] font-semibold transition-all shadow-sm"
          >
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md shadow-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, or case number..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#6899B0]/20 transition-all font-medium text-slate-900 placeholder:font-normal"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <Activity className="animate-spin text-[#6899B0]" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Case Number</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Mobile</th>
                <th className="p-4 font-bold">Age/Gender</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{patient.case_number}</td>
                  <td className="p-4 text-slate-700 font-medium">{patient.first_name} {patient.last_name}</td>
                  <td className="p-4 text-slate-600">{patient.mobile}</td>
                  <td className="p-4 text-slate-600">{patient.age} / {patient.gender}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="text-[#6899B0] hover:text-[#5D8799] font-bold text-sm bg-[#6899B0]/10 hover:bg-[#6899B0]/20 px-3 py-1.5 rounded-md transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No patients found</h3>
                    <p className="text-slate-500">Get started by registering a new patient.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Register New Patient</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                  <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                  <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mobile Number</label>
                  <input required type="tel" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <input required type="date" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={formData.dob} max={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
                <select className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900 bg-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] transition-colors shadow-sm">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

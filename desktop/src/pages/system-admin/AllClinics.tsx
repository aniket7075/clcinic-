import React from 'react';
import { Building2, Settings, ExternalLink } from 'lucide-react';

const AllClinics: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Clinics</h2>
          <p className="text-sm text-slate-500">Manage all approved clinics and their subscription statuses.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { id: 1, name: 'Dental Excellence', contact: 'dr.smith@example.com', plan: 'Enterprise', status: 'Active' },
              { id: 2, name: 'City Care Clinic', contact: 'citycare@example.com', plan: 'Professional', status: 'Active' },
              { id: 3, name: 'Metro Smiles', contact: 'metro@example.com', plan: 'Starter', status: 'Active' },
            ].map((clinic) => (
              <tr key={clinic.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                      <Building2 size={16} />
                    </div>
                    <span className="font-bold text-slate-900">{clinic.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{clinic.contact}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                    {clinic.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    {clinic.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Manage Subscription">
                      <Settings size={18} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Details">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllClinics;

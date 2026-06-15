import React, { useState } from 'react';
import { Check, X, Building2, Calendar, Mail, Phone } from 'lucide-react';

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

const mockRequests: ClinicRequest[] = [
  {
    id: 'req_1',
    name: 'Smile Dental Care',
    ownerName: 'Dr. Ramesh Kumar',
    email: 'dr.ramesh@smiledental.in',
    phone: '+91 9876543210',
    plan: 'Professional',
    date: '2023-11-20',
    status: 'pending'
  },
  {
    id: 'req_2',
    name: 'Apollo Dental',
    ownerName: 'Dr. Anita Desai',
    email: 'anita@apollo-dental.com',
    phone: '+91 8765432109',
    plan: 'Enterprise',
    date: '2023-11-21',
    status: 'pending'
  },
  {
    id: 'req_3',
    name: 'City Smiles',
    ownerName: 'Dr. Vivek Sharma',
    email: 'contact@citysmiles.co.in',
    phone: '+91 7654321098',
    plan: 'Starter',
    date: '2023-11-22',
    status: 'pending'
  }
];

const ClinicRequests: React.FC = () => {
  const [requests, setRequests] = useState<ClinicRequest[]>(mockRequests);

  const handleApprove = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    // In a real app, this would make an API call to update the clinic status to 'active'
    alert('Clinic approved and activated!');
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    // In a real app, this would update status to 'rejected'
    alert('Clinic request rejected.');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
        <p className="text-sm text-slate-500">Review and approve new clinic registrations to grant them software access.</p>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No pending requests at the moment.
          </div>
        ) : (
          requests.map(req => (
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
                  onClick={() => handleApprove(req.id)}
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
  );
};

export default ClinicRequests;

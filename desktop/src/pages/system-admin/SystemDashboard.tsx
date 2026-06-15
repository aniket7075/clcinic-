import React from 'react';
import { Users, Building, Activity, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 6000 },
  { name: 'Mar', revenue: 8000 },
  { name: 'Apr', revenue: 15000 },
  { name: 'May', revenue: 21000 },
  { name: 'Jun', revenue: 35000 },
];

const SystemDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total MRR</h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">₹35,000</p>
          <p className="text-sm text-emerald-600 font-medium mt-2 flex items-center">
            +14% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">Active Clinics</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Building size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">12</p>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Across 5 cities
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">84</p>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Doctors & Staff
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500">Pending Requests</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">3</p>
          <p className="text-sm text-orange-600 font-medium mt-2">
            Awaiting Approval
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Growth (MRR)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;

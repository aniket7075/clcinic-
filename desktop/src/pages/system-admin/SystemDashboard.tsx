import React, { useState, useEffect } from 'react';
import { Users, Building, Activity, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

const SystemDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    mrr: 0,
    activeClinics: 0,
    totalUsers: 0,
    pendingRequests: 0,
    chartData: [
      { name: 'Jan', revenue: 0 },
      { name: 'Feb', revenue: 0 },
      { name: 'Mar', revenue: 0 },
      { name: 'Apr', revenue: 0 },
      { name: 'May', revenue: 0 },
      { name: 'Jun', revenue: 0 },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clinicsRes, requestsRes] = await Promise.all([
          api.get('/clinics'),
          api.get('/clinics/requests')
        ]);

        const clinics = clinicsRes.data || [];
        const requests = requestsRes.data || [];

        let mrr = 0;
        let activeClinics = 0;
        let totalUsers = 0;
        
        // Month array for chart (last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
          let mIndex = currentMonth - i;
          if (mIndex < 0) mIndex += 12;
          chartData.push({ name: monthNames[mIndex], monthIndex: mIndex, revenue: 0 });
        }

        clinics.forEach((c: any) => {
          totalUsers += (c.profiles?.length || 0);
          
          if (c.subscription_status === 'ACTIVE' || c.is_active) {
            activeClinics++;
            let planValue = 0;
            const plan = c.subscription_plan?.toUpperCase() || '';
            if (plan === 'STARTER') planValue = 650;
            else if (plan === 'PRO') planValue = 1150;
            else if (plan === 'ENTERPRISE') planValue = 2300;
            
            mrr += planValue;

            // Add to chart based on created_at month
            if (c.created_at) {
              const createdMonth = new Date(c.created_at).getMonth();
              const chartItem = chartData.find(d => d.monthIndex === createdMonth);
              if (chartItem) {
                chartItem.revenue += planValue;
              }
            }
          }
        });

        // Cumulative sum for the chart (MRR grows over time)
        let accumulated = 0;
        const cumulativeChartData = chartData.map(d => {
          accumulated += d.revenue;
          return { name: d.name, revenue: accumulated || d.revenue }; // fallback if all 0
        });

        const pendingRequests = requests.filter((r: any) => r.status === 'PENDING').length;

        setStats({
          mrr,
          activeClinics,
          totalUsers,
          pendingRequests,
          chartData: cumulativeChartData
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

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
          <p className="text-3xl font-black text-slate-900">₹{stats.mrr.toLocaleString()}</p>
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
          <p className="text-3xl font-black text-slate-900">{stats.activeClinics}</p>
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
          <p className="text-3xl font-black text-slate-900">{stats.totalUsers}</p>
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
          <p className="text-3xl font-black text-slate-900">{stats.pendingRequests}</p>
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
            <BarChart data={stats.chartData}>
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

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, IndianRupee, Package, Download, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'appointments' | 'inventory'>('financial');
  const [reportData, setReportData] = useState<any>(null);
  const [expensesData, setExpensesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const apiTab = activeTab === 'financial' ? 'revenue' : activeTab;
      const endpoint = `/reports/${apiTab}`;
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const res = await api.get(`${endpoint}?${params.toString()}`);
      setReportData(res.data);

      if (activeTab === 'financial') {
        const expRes = await api.get(`/reports/expenses?${params.toString()}`);
        setExpensesData(expRes.data);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const apiTab = activeTab === 'financial' ? 'revenue' : activeTab;
      const endpoint = `/reports/${apiTab}/export`;
      const params = new URLSearchParams();
      params.append('format', format);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const res = await api.get(`${endpoint}?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report');
    }
  };

  // Process data for charts
  const getRevenueChartData = () => {
    if (!reportData || !Array.isArray(reportData)) return [];
    
    // Group by date
    const grouped = reportData.reduce((acc: any, curr: any) => {
      const date = new Date(curr.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { revenue: 0, expenses: 0 };
      acc[date].revenue += Number(curr.amount);
      return acc;
    }, {});

    if (expensesData && Array.isArray(expensesData)) {
      expensesData.forEach((curr: any) => {
        const date = new Date(curr.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!grouped[date]) grouped[date] = { revenue: 0, expenses: 0 };
        grouped[date].expenses += Number(curr.amount);
      });
    }

    return Object.keys(grouped).map(date => ({
      date,
      revenue: grouped[date].revenue,
      expenses: grouped[date].expenses,
      netProfit: grouped[date].revenue - grouped[date].expenses
    }));
  };

  const getExpenseBreakdownData = () => {
    if (!expensesData || !Array.isArray(expensesData)) return [];

    const grouped = expensesData.reduce((acc: any, curr: any) => {
      const cat = curr.category || 'OTHER';
      acc[cat] = (acc[cat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const colors: any = {
      'SALARY': '#6366f1',
      'LAB_WORK': '#06b6d4',
      'EXTERNAL_DOCTOR': '#8b5cf6',
      'RENT': '#3b82f6',
      'EQUIPMENT': '#f59e0b',
      'MARKETING': '#ec4899',
      'DAILY_EXPENSES': '#10b981',
      'UTILITIES': '#64748b',
      'OTHER': '#94a3b8'
    };

    return Object.keys(grouped).map(cat => ({
      name: cat.replace('_', ' '),
      value: grouped[cat],
      color: colors[cat] || '#94a3b8'
    })).sort((a, b) => b.value - a.value);
  };

  const getAppointmentsChartData = () => {
    if (!reportData || !Array.isArray(reportData)) return [];
    
    const counts = reportData.reduce((acc: any, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const colors: any = {
      'COMPLETED': '#10b981', // green
      'SCHEDULED': '#3b82f6', // blue
      'CONFIRMED': '#6366f1', // indigo
      'CANCELLED': '#ef4444', // red
      'NO_SHOW': '#f59e0b',   // orange
    };

    return Object.keys(counts).map(status => ({
      name: status,
      value: counts[status],
      color: colors[status] || '#94a3b8'
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <BarChart2 className="text-[#6899B0]" /> Advanced Analytics
        </h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-black font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white font-medium rounded-lg hover:bg-[#5D8799] transition-colors shadow-sm">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'financial' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
            }`}
          >
            <IndianRupee size={18} /> Financial Performance
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'appointments' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
            }`}
          >
            <Calendar size={18} /> Appointments Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'inventory' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
            }`}
          >
            <Package size={18} /> Inventory Stock
          </button>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start</span>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-white border border-slate-200 rounded p-1.5 text-sm font-medium outline-none focus:border-[#6899B0]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">End</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-white border border-slate-200 rounded p-1.5 text-sm font-medium outline-none focus:border-[#6899B0]" />
          </div>
          <button onClick={fetchReport} className="px-4 py-1.5 bg-black text-white font-bold rounded hover:bg-slate-800 transition-colors">Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Gathering analytics data...</div>
      ) : (
        <div className="space-y-6">
          {(!reportData || reportData.length === 0) ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <BarChart2 className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No data available for the selected range.</p>
            </div>
          ) : activeTab === 'financial' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-black mb-6">Revenue & Expenses Trend</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getRevenueChartData()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `₹${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-rows-3 gap-6">
                <div className="bg-emerald-50 rounded-xl shadow-sm border border-emerald-100 p-4 flex flex-col justify-center text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-extrabold text-emerald-800">
                    ₹{(reportData.reduce((sum: number, item: any) => sum + Number(item.amount), 0)).toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4 flex flex-col justify-center text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Total Expenses</p>
                  <p className="text-2xl font-extrabold text-red-800">
                    ₹{(expensesData ? expensesData.reduce((sum: number, item: any) => sum + Number(item.amount), 0) : 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-4 flex flex-col justify-center text-center">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Net Profit</p>
                  <p className="text-3xl font-extrabold text-white">
                    ₹{((reportData.reduce((sum: number, item: any) => sum + Number(item.amount), 0)) - (expensesData ? expensesData.reduce((sum: number, item: any) => sum + Number(item.amount), 0) : 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-black mb-6">Expense Breakdown</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getExpenseBreakdownData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getExpenseBreakdownData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h2 className="text-lg font-bold text-black mb-6">Category Summary</h2>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="pb-3 px-4 font-bold">Category</th>
                        <th className="pb-3 px-4 font-bold text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getExpenseBreakdownData().map((row: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-bold flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></div>
                            {row.name}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-800">
                            ₹{row.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {getExpenseBreakdownData().length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-8 text-center text-slate-500">No expenses recorded for this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
          ) : activeTab === 'appointments' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-black mb-6">Status Breakdown</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getAppointmentsChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getAppointmentsChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h2 className="text-lg font-bold text-black mb-6">Recent Appointments</h2>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="pb-3 px-4 font-bold">Date</th>
                        <th className="pb-3 px-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.slice(0, 8).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-black">{new Date(row.appointment_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                              row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              row.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-[#5D8799]'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <pre className="bg-slate-50 p-4 rounded-lg overflow-auto text-sm text-slate-600 border border-slate-100">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

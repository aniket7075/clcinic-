import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, IndianRupee, Package, Download } from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'appointments' | 'inventory'>('financial');
  const [reportData, setReportData] = useState<any>(null);
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Analytics & Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-black rounded-lg hover:bg-slate-50">
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799]">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'financial' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-black hover:bg-slate-50'
            }`}
          >
            <IndianRupee size={18} /> Financial
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'appointments' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-black hover:bg-slate-50'
            }`}
          >
            <Calendar size={18} /> Appointments
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'inventory' ? 'bg-[#E0EEF5] text-[#5D8799]' : 'text-black hover:bg-slate-50'
            }`}
          >
            <Package size={18} /> Inventory
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-black">Start:</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="border border-slate-300 rounded p-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-black">End:</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="border border-slate-300 rounded p-1 text-sm" />
          </div>
          <button onClick={fetchReport} className="px-3 py-1 bg-slate-800 text-white rounded text-sm hover:bg-slate-700">Filter</button>
        </div>
      </div>

      {loading ? (
        <p className="text-black">Loading report data...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-black capitalize mb-4">{activeTab} Report Summary</h2>
          {(!reportData || reportData.length === 0) ? (
            <p className="text-black text-center py-8">No data available for the selected range.</p>
          ) : activeTab === 'financial' ? (
            <div>
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg inline-block">
                <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-700">
                  ₹ {reportData.reduce((sum: number, item: any) => sum + Number(item.amount), 0).toFixed(2)}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-black text-sm uppercase tracking-wider">
                      <th className="pb-3 px-4 font-medium">Date</th>
                      <th className="pb-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-black">{new Date(row.payment_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium text-black">₹ {Number(row.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'appointments' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-black text-sm uppercase tracking-wider">
                    <th className="pb-3 px-4 font-medium">Date</th>
                    <th className="pb-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-black">{new Date(row.appointment_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          ) : (
            <pre className="bg-slate-50 p-4 rounded-lg overflow-auto text-sm text-black border border-slate-100">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShieldAlert, Search } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">System Audit Logs</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by action or resource type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6899B0]"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-black">Loading audit logs...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="p-4 text-black text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-4 text-black font-mono text-xs">
                    {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : (log.user_id ? log.user_id.substring(0, 8) + '...' : 'SYSTEM')}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 text-black font-medium text-xs rounded uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-black">{log.resource_type}</td>
                  <td className="p-4 text-black text-sm max-w-lg align-top">
                    {log.details ? (
                      <div className="max-h-48 overflow-auto bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner custom-scrollbar">
                        <pre className="text-[11px] leading-relaxed font-mono text-emerald-400 whitespace-pre">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlert size={48} className="text-slate-300 mb-4" />
                      <p>No audit logs found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

import React, { useState, useEffect } from 'react';
import { Save, Mail, Server, Shield, EyeOff, Eye } from 'lucide-react';
import axios from '../../api/axios';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  senderName: string;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    senderName: 'Q Dent Admin'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/system/settings');
      const smtpSetting = res.data.find((s: any) => s.key === 'smtp_config');
      if (smtpSetting && smtpSetting.value) {
        setConfig(smtpSetting.value);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/system/settings/smtp_config', { value: config });
      alert('SMTP Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Global System Settings</h2>
        <p className="text-slate-500 text-sm">Configure system-wide settings like Email delivery.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <Mail className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800">Email Configuration (SMTP)</h3>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Sender Name</label>
              <input 
                type="text" 
                value={config.senderName}
                onChange={e => setConfig({...config, senderName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Q Dent Admin"
                required
              />
              <p className="text-[11px] text-slate-500">This is the name patients will see in their inbox.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Email Address (SMTP User)</label>
              <input 
                type="email" 
                value={config.user}
                onChange={e => setConfig({...config, user: e.target.value})}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. yourclinic@gmail.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">App Password</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  value={config.pass}
                  onChange={e => setConfig({...config, pass: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="16-letter App Password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">For Gmail, use a 16-character App Password, not your real password.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1"><Server size={14} /> SMTP Host</label>
              <input 
                type="text" 
                value={config.host}
                onChange={e => setConfig({...config, host: e.target.value})}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">SMTP Port</label>
                <input 
                  type="number" 
                  value={config.port}
                  onChange={e => setConfig({...config, port: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="587"
                  required
                />
              </div>
              <div className="flex items-center gap-2 mt-7">
                <input 
                  type="checkbox" 
                  id="secure"
                  checked={config.secure}
                  onChange={e => setConfig({...config, secure: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="secure" className="text-sm font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <Shield size={14} /> Secure (SSL/TLS)
                </label>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;

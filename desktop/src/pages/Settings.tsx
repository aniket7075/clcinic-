import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Save, Building, Phone, Mail, MapPin, MessageSquare, List } from 'lucide-react';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    configData: {
      enableNotifications: true,
      enableWhatsappReminders: true,
      theme: 'light'
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'templates'>('profile');
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/settings/notifications');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/clinic');
      if (res.data) {
        setFormData({
          clinicName: res.data.name || '',
          address: res.data.address || '',
          phone: res.data.contact_mobile || '',
          email: res.data.contact_email || '',
          taxId: res.data.gst_number || '',
          configData: { enableNotifications: true, enableWhatsappReminders: true, theme: 'light' }
        });
      }
    } catch (err) {
      console.error('Error fetching settings profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (templateId: string, newSubject: string, newBody: string) => {
    try {
      const tmpl = templates.find(t => t.id === templateId);
      if (!tmpl) return;
      await api.post('/settings/notifications', {
        name: tmpl.name,
        type: tmpl.type,
        subject: newSubject,
        body: newBody
      });
      alert('Template saved successfully!');
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/clinic', {
        name: formData.clinicName,
        address: formData.address,
        contact_mobile: formData.phone,
        contact_email: formData.email,
        gst_number: formData.taxId
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-black">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Clinic Settings</h1>
      </div>

      <div className="flex border-b border-slate-200 mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-[#6899B0] text-[#6899B0]' : 'border-transparent text-black hover:text-black'}`}
        >
          <Building size={18} /> Clinic Profile
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'templates' ? 'border-[#6899B0] text-[#6899B0]' : 'border-transparent text-black hover:text-black'}`}
        >
          <MessageSquare size={18} /> Communication Templates
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'profile' ? (
          <>
            <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <Building size={18} className="text-[#6899B0]" />
                Clinic Profile
              </h2>
              <p className="text-sm text-black mt-1">Update your clinic's public information and contact details.</p>
            </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Clinic Name</label>
            <input 
              type="text" 
              value={formData.clinicName}
              onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6899B0] focus:border-blue-500 outline-none"
              placeholder="e.g. Bright Smile Dental"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1 flex items-center gap-1">
                <Phone size={14} className="text-slate-400" /> Phone Number
              </label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6899B0] focus:border-blue-500 outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1 flex items-center gap-1">
                <Mail size={14} className="text-slate-400" /> Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6899B0] focus:border-blue-500 outline-none"
                placeholder="contact@clinic.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1 flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" /> Address
            </label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6899B0] focus:border-blue-500 outline-none min-h-[80px]"
              placeholder="Full street address..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Tax ID / Registration Number</label>
            <input 
              type="text" 
              value={formData.taxId}
              onChange={(e) => setFormData({...formData, taxId: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#6899B0] focus:border-blue-500 outline-none"
              placeholder="e.g. 12-3456789"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <h3 className="font-semibold text-black mb-4">Application Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <div>
                <p className="font-medium text-black">Email Notifications</p>
                <p className="text-sm text-black">Receive daily summary and alerts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!!formData.configData?.enableNotifications}
                  onChange={(e) => setFormData({...formData, configData: {...formData.configData, enableNotifications: e.target.checked}})}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6899B0]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <div>
                <p className="font-medium text-black">Automated WhatsApp Reminders</p>
                <p className="text-sm text-black">Automatically send reminders 1 day before the appointment.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!!formData.configData?.enableWhatsappReminders}
                  onChange={(e) => setFormData({...formData, configData: {...formData.configData, enableWhatsappReminders: e.target.checked}})}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6899B0]"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
        </>
        ) : (
          <div className="p-6">
            <div className="mb-6">
               <h2 className="text-lg font-bold text-black mb-2 flex items-center gap-2"><List size={20} className="text-[#6899B0]"/> Automated Templates</h2>
               <p className="text-black text-sm">Configure the SMS and Email messages that get sent to patients automatically.</p>
            </div>
            
            <div className="space-y-8">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-black uppercase tracking-wider text-sm">{tmpl.name.replace(/_/g, ' ')} ({tmpl.type})</h3>
                     <button 
                       onClick={() => handleSaveTemplate(tmpl.id, tmpl.subject, tmpl.body)}
                       className="px-3 py-1 bg-blue-100 text-[#5D8799] rounded hover:bg-blue-200 transition text-xs font-medium"
                     >
                       Save Template
                     </button>
                  </div>
                  <div className="space-y-3">
                    {tmpl.type === 'EMAIL' && (
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Subject</label>
                        <input 
                          type="text" 
                          value={tmpl.subject || ''} 
                          onChange={(e) => {
                            const newTmpl = templates.map(t => t.id === tmpl.id ? {...t, subject: e.target.value} : t);
                            setTemplates(newTmpl);
                          }}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#6899B0] outline-none text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-black mb-1">Message Body</label>
                      <textarea 
                        value={tmpl.body || ''} 
                        onChange={(e) => {
                          const newTmpl = templates.map(t => t.id === tmpl.id ? {...t, body: e.target.value} : t);
                          setTemplates(newTmpl);
                        }}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#6899B0] outline-none text-sm h-24"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-black">No templates found in database.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

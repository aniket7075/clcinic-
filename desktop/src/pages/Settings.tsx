import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Save, Building, Phone, Mail, MapPin, MessageSquare, List, CreditCard, CheckCircle2 } from 'lucide-react';

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

  const [clinicId, setClinicId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'templates' | 'subscription'>('profile');
  const [templates, setTemplates] = useState<any[]>([]);

  // Subscription state
  const [activePlan, setActivePlan] = useState<string>('starter');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string>('');
  
  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<'pro' | 'enterprise'>('pro');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
        
        setClinicId(res.data.id || '');
        setActivePlan(res.data.subscription_plan || 'starter');
        if (res.data.subscription_expiry) {
          const date = new Date(res.data.subscription_expiry);
          setSubscriptionExpiry(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        }
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

  const handleUpgradeClick = (plan: 'pro' | 'enterprise') => {
    setSelectedPlanToUpgrade(plan);
    setIsPaymentModalOpen(true);
    setPaymentSuccess(false);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    try {
      // Simulate network delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await api.post('/settings/subscription/upgrade', {
        plan: selectedPlanToUpgrade
      });
      
      setActivePlan(res.data.clinic.subscription_plan);
      const date = new Date(res.data.clinic.subscription_expiry);
      setSubscriptionExpiry(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setProcessingPayment(false);
        setPaymentSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Payment failed. Please try again.');
      setProcessingPayment(false);
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
          className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'templates' ? 'border-[#6899B0] text-[#6899B0]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <MessageSquare size={18} /> Communication Templates
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'subscription' ? 'border-[#6899B0] text-[#6899B0]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <CreditCard size={18} /> Subscription & Billing
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'profile' && (
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
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">Public Booking Portal</h3>
            <p className="text-sm text-slate-600 mb-4">Share this link with your patients so they can book appointments online directly.</p>
            
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                readOnly
                value={`${window.location.origin}/book/${clinicId}`}
                className="flex-1 p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium outline-none"
              />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/book/${clinicId}`);
                  alert('Booking Link Copied to Clipboard!');
                }}
                className="px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
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
        )}
        
        {activeTab === 'templates' && (
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

        {activeTab === 'subscription' && (
          <div className="p-6">
            <div className="mb-8">
               <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2"><CreditCard size={24} className="text-[#6899B0]"/> Subscription Plan</h2>
               <p className="text-slate-500">Manage your current plan and billing details.</p>
            </div>
            
            {/* Current Plan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{activePlan} Plan</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">Active</span>
                </div>
                <p className="text-slate-500 font-medium">Next billing date is {subscriptionExpiry || 'July 1st, 2026'}.</p>
              </div>
              <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                Cancel Plan
              </button>
            </div>

            {/* Upgrade Options */}
            <h3 className="text-lg font-bold text-slate-900 mb-6">Upgrade Options</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-[#6899B0] bg-[#6899B0]/5 rounded-2xl p-6 relative">
                <div className="absolute top-0 right-0 bg-[#6899B0] text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-xs font-bold uppercase tracking-wider">Recommended</div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">Professional</h4>
                <p className="text-2xl font-black text-[#6899B0] mb-4">₹3,499<span className="text-sm font-medium text-slate-500">/mo</span></p>
                <ul className="space-y-3 mb-6">
                  {['Up to 5 Staff Accounts', 'Advanced Inventory Management', 'Staff Attendance & Leaves'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 size={16} className="text-[#6899B0]" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgradeClick('pro')}
                  disabled={activePlan === 'pro' || activePlan === 'enterprise'}
                  className={`w-full py-2.5 font-bold rounded-lg transition-colors shadow-sm ${activePlan === 'pro' || activePlan === 'enterprise' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#6899B0] text-white hover:bg-[#5D8799]'}`}
                >
                  {activePlan === 'pro' || activePlan === 'enterprise' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>

              <div className="border border-slate-200 bg-white rounded-2xl p-6">
                <h4 className="text-xl font-bold text-slate-900 mb-1">Enterprise</h4>
                <p className="text-2xl font-black text-slate-900 mb-4">₹6,999<span className="text-sm font-medium text-slate-500">/mo</span></p>
                <ul className="space-y-3 mb-6">
                  {['Unlimited Staff Accounts', 'Multi-Clinic Management', 'Dedicated Account Manager'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 size={16} className="text-slate-400" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgradeClick('enterprise')}
                  disabled={activePlan === 'enterprise'}
                  className={`w-full py-2.5 font-bold rounded-lg transition-colors shadow-sm border ${activePlan === 'enterprise' ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  {activePlan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {/* Razorpay Simulation Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="bg-[#121212] p-5 text-white flex justify-between items-start relative">
               <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl uppercase">Test Mode</div>
               <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-white rounded flex items-center justify-center font-bold text-black text-xl">Q</div>
                 <div>
                   <h2 className="font-medium text-lg leading-tight">Q Dent</h2>
                   <p className="text-white/60 text-sm">Subscription Upgrade</p>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-white/60 text-xs">Amount</p>
                  <p className="font-semibold text-lg">₹{selectedPlanToUpgrade === 'pro' ? '3,499' : '6,999'}</p>
               </div>
            </div>
            
            {/* Razorpay Body */}
            {paymentSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Payment Successful</h3>
                <p className="text-slate-500 text-sm">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={processPayment} className="p-0 flex-1 flex flex-col min-h-[400px]">
                <div className="bg-[#F4F8FB] p-3 text-xs text-center border-b border-slate-200 text-slate-500">
                   English | ₹ INR
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="text-sm font-medium text-slate-800 mb-2">Contact Details</div>
                  <input type="text" defaultValue={formData.phone} placeholder="Phone Number" className="w-full p-3 border-b border-slate-300 text-sm outline-none focus:border-blue-500 transition-colors" required />
                  <input type="email" defaultValue={formData.email} placeholder="Email Address" className="w-full p-3 border-b border-slate-300 text-sm outline-none focus:border-blue-500 transition-colors" required />
                  
                  <div className="text-sm font-medium text-slate-800 mt-6 mb-2">Cards, UPI & More</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                     <div className="flex items-center gap-3 p-3 border-b border-slate-200 bg-blue-50/50 cursor-pointer">
                        <CreditCard size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Card</span>
                     </div>
                     <div className="p-4 space-y-3 bg-white">
                        <input type="text" placeholder="Card Number" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Expiry (MM/YY)" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                          <input type="text" placeholder="CVV" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Razorpay Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <button 
                    type="submit" 
                    disabled={processingPayment}
                    className="w-full py-3.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 transition-all flex justify-center items-center shadow-md shadow-blue-600/20 uppercase tracking-wide text-sm"
                  >
                    {processingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${selectedPlanToUpgrade === 'pro' ? '3,499' : '6,999'}`
                    )}
                  </button>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">Secured by Razorpay</span>
                    <button type="button" onClick={() => !processingPayment && setIsPaymentModalOpen(false)} className="text-[11px] text-slate-500 hover:text-slate-800 font-medium">Cancel</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

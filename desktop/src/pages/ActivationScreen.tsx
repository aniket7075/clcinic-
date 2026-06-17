import React, { useState } from 'react';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ActivationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    activation_key: '',
    password: '',
    confirm_password: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setStatus('error');
      setErrorMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    try {
      await api.post('/public/activate-clinic', {
        email: formData.email,
        activation_key: formData.activation_key,
        password: formData.password
      });
      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Activation failed. Please check your key.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <KeyRound className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Activate Product</h2>
          <p className="text-blue-100 text-sm">Enter the activation key sent to your email to unlock Q Dent</p>
        </div>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Activation Successful!</h3>
              <p className="text-slate-600">Your account has been created. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-5">
              {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Activation Key</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.activation_key}
                    onChange={e => setFormData({...formData, activation_key: e.target.value.toUpperCase()})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                    placeholder="QDE-XXXX-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Create Admin Password</label>
                <div className="relative mb-4">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Set your login password"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.confirm_password}
                    onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mt-6 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate & Start Using Q Dent'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivationScreen;

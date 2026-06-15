import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '../store/authSlice';
import api, { setAuthToken } from '../api/axios';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Start fading out after 3 seconds
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
      // Remove splash completely after fade out animation
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 800);
      return () => clearTimeout(removeTimer);
    }, 3000);
    return () => clearTimeout(fadeTimer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLocalLoading(true);
    setError('');
    dispatch(setLoading(true));

    try {
      // --- MOCK INTERCEPTS FOR DEMO PURPOSES ---
      if (email === 'admin@qdent.com') {
        const mockUser = { id: 'sysadmin', email: 'admin@qdent.com', role: 'SYSTEM_ADMIN', firstName: 'System', lastName: 'Admin' };
        dispatch(setCredentials({ user: mockUser as any, token: 'mock_sysadmin_token' }));
        return;
      }
      
      if (email.includes('pending') || email.includes('newclinic')) {
        setError('Your account is pending approval from the Q Dent system administrator. Please wait until your subscription is activated.');
        return;
      }
      // -----------------------------------------

      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      setAuthToken(token);
      dispatch(setCredentials({ user, token }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      {showSplash && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 ${fadeSplash ? 'animate-splash-fade-out' : ''}`}>
          <div className="relative flex flex-col items-center">
            <div className="animate-tooth-enter w-72 h-72 md:w-96 md:h-96 drop-shadow-2xl">
              <img src="/logo.png" alt="Q DENT Logo" className="w-full h-full object-contain shine-effect" />
            </div>
          </div>
        </div>
      )}

      {/* Actual Login Form */}
      <div
        className={`flex items-center justify-between min-h-screen px-6 md:px-16 lg:px-32 xl:px-48 bg-cover bg-center bg-no-repeat relative before:absolute before:inset-0 before:bg-black/10 transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: 'url("/dental-new.jpg")' }}
      >
        {/* Left Side Logo / Branding (Hidden on mobile to save space) */}
        <div className="hidden lg:flex flex-col items-start relative z-10 w-full max-w-lg pr-12">
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30">
            <img src="/logo.png" alt="Q DENT Logo" className="w-full object-contain drop-shadow-lg" />
          </div>
        </div>

        <div className="w-full max-w-md p-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 animate-fade-in-up relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="p-5 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md rounded-full mb-4 shadow-[0_0_20px_rgba(255,255,255,0.6)] border border-white/60 relative overflow-hidden shine-effect">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white drop-shadow-lg">
                <path d="M16 2c-2 0-3.5 1-4 2-.5-1-2-2-4-2-2.2 0-4 1.8-4 4v3c0 2 1 4 2.5 5.5L9.5 21c.5 1 1.5 1 2 0l1.5-3 1.5 3c.5 1 1.5 1 2 0l3-6.5C21 13 22 11 22 9V6c0-2.2-1.8-4-4-4zM9.5 16l-2-4.5c-1-1-2-2.5-2-4V6c0-1.1.9-2 2-2 1 0 2.5 1 3 2.5v2h-2v1.5h2v2H9.5zM17.5 11.5l-2 4.5H15v-2h2v-1.5h-2v-2c.5-1.5 2-2.5 3-2.5 1.1 0 2 .9 2 2v1.5c0 1.5-1 3-2 4.5z" />
              </svg>
            </div>
            <p className="text-slate-800 text-lg font-bold tracking-wide">Desktop Portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center animate-fade-in-delayed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in-delayed">
            <div>
              <label className="block text-sm font-semibold text-black mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm text-black placeholder:text-slate-600 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all duration-200"
                placeholder="admin@clinic.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-sm text-black placeholder:text-slate-600 border border-white/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all duration-200 flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {localLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

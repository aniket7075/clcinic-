import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Building, CheckCircle, Shield } from 'lucide-react';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';

const SystemAdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-[280px] bg-slate-900 text-white flex flex-col shadow-2xl shadow-black/10 z-10 overflow-hidden relative">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Q Dent</h2>
              <p className="text-xs text-slate-400">System Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/system-admin" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/system-admin' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/system-admin/requests" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/system-admin/requests' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <CheckCircle size={20} />
            <span>Clinic Requests</span>
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
          </Link>
          <Link to="/system-admin/clinics" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/system-admin/clinics' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Building size={20} />
            <span>All Clinics</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 mb-4">
            <p className="text-sm font-bold text-white">{user?.firstName || 'System'} {user?.lastName || 'Admin'}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-red-500/20 hover:text-red-400 transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {location.pathname === '/system-admin' ? 'SaaS Overview' : 
             location.pathname === '/system-admin/requests' ? 'Subscription Requests' : 'All Clinics'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SystemAdminLayout;

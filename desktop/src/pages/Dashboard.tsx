import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { LogOut, Users, Calendar, LayoutDashboard, Settings, UserCircle, IndianRupee, Package, BarChart2, FileText, Activity, HelpCircle, Bell, Building2 } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import ClinicSwitcher from '../components/ClinicSwitcher';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  todayAppointments: number;
  monthlyAppointments: number;
  todayRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  followUpPatients: number;
  lowStockAlerts: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
    const user = useSelector((state: RootState) => state.auth.user);
    const clinicName = useSelector((state: RootState) => state.auth.clinicName);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN';
    const isHome = location.pathname === '/';
  
    useEffect(() => {
      if (isHome) {
        const fetchStats = async () => {
          try {
            const res = await axios.get('/dashboard/stats');
            setStats(res.data);
          } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
          } finally {
            setLoading(false);
          }
        };
        fetchStats();
      }
    }, [isHome]);
  
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <div className="w-[280px] bg-[oklch(0.74_0.04_205.97)] text-white flex flex-col shadow-2xl shadow-black/10 z-10 overflow-hidden relative">
          
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
  
          <div className="p-6 pb-2 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                <span className="text-white font-extrabold text-xl">{clinicName.charAt(0)}</span>
              </div>
              <h2 className="text-[17px] font-extrabold text-white tracking-wide leading-tight line-clamp-2">{clinicName}</h2>
            </div>
            <ClinicSwitcher />
          </div>
        
        <nav className="flex-1 flex flex-col px-4 space-y-1 overflow-y-auto pb-4 mt-4 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link to="/" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${isHome ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <LayoutDashboard size={20} strokeWidth={isHome ? 2.5 : 2} />
            <span>Dashboard</span>
          </Link>
          <Link to="/appointments" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/appointments') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <Calendar size={20} strokeWidth={location.pathname.startsWith('/appointments') ? 2.5 : 2} />
            <span>Appointments</span>
          </Link>
          <Link to="/patients" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/patients') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <Users size={20} strokeWidth={location.pathname.startsWith('/patients') ? 2.5 : 2} />
            <span>Patients</span>
          </Link>
          <Link to="/billing" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/billing') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <IndianRupee size={20} strokeWidth={location.pathname.startsWith('/billing') ? 2.5 : 2} />
            <span>Billing</span>
          </Link>
          <Link to="/inventory" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/inventory') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <Package size={20} strokeWidth={location.pathname.startsWith('/inventory') ? 2.5 : 2} />
            <span>Inventory</span>
          </Link>

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest opacity-80">Personal</p>
          </div>
          <Link to="/schedule" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/schedule') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'} w-full text-left`}>
            <Calendar size={20} strokeWidth={location.pathname.startsWith('/schedule') ? 2.5 : 2} />
            <span>My Schedule</span>
          </Link>
          <Link to="/notifications" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/notifications') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'} w-full text-left`}>
            <Bell size={20} strokeWidth={location.pathname.startsWith('/notifications') ? 2.5 : 2} />
            <span>Notifications</span>
          </Link>
          {isAdmin && (
            <>
              <div className="pt-4 pb-1.5 px-4">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest opacity-80">Administration</p>
              </div>
              <Link to="/staff" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/staff') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                <UserCircle size={20} strokeWidth={location.pathname.startsWith('/staff') ? 2.5 : 2} />
                <span>Staff Management</span>
              </Link>
              <Link to="/reports" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/reports') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                <BarChart2 size={20} strokeWidth={location.pathname.startsWith('/reports') ? 2.5 : 2} />
                <span>Reports</span>
              </Link>
              {user?.role === 'SUPER_ADMIN' && (
                <Link to="/manage-clinics" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/manage-clinics') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                  <Building2 size={20} strokeWidth={location.pathname.startsWith('/manage-clinics') ? 2.5 : 2} />
                  <span>Manage Clinics</span>
                </Link>
              )}

              <Link to="/settings" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/settings') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                <Settings size={20} strokeWidth={location.pathname.startsWith('/settings') ? 2.5 : 2} />
                <span>Settings</span>
              </Link>
            </>
          )}

          <div className="mt-auto pt-8 pb-2">
            <div className="px-4 mb-2">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest opacity-80">{user?.role?.replace('_', ' ')}</p>
              <p className="text-sm font-extrabold text-white mt-1">{user?.firstName} {user?.lastName}</p>
            </div>
            <Link 
              to="/support"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-white font-bold hover:bg-white/10 hover:text-white transition-all w-full  hover:translate-x-1"
            >
              <HelpCircle size={20} strokeWidth={2} />
              <span>Help & Support</span>
            </Link>
            <button 
              onClick={() => dispatch(logout())}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-white font-bold hover:bg-red-500/20 hover:text-red-300 transition-all w-full text-left  hover:translate-x-1"
            >
              <LogOut size={20} strokeWidth={2} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isHome ? (
          <>
            <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
              <div className="text-sm text-black">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Activity className="animate-spin text-[#6899B0]" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">Today's Appointments</h3>
                      <div className="p-2 bg-[#E0EEF5] rounded-lg text-[#6899B0]">
                        <Calendar size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">{stats?.todayAppointments}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">Total Patients</h3>
                      <div className="p-2 bg-[#E0EEF5] rounded-lg text-[#6899B0]">
                        <Users size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">{stats?.totalPatients}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">Today's Revenue</h3>
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <IndianRupee size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">₹{stats?.todayRevenue}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">Pending Payments</h3>
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <IndianRupee size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">₹{stats?.pendingPayments}</p>
                  </div>

                  {isAdmin && (
                    <>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="text-black text-sm ">Low Stock Alerts</h3>
                          <div className={`p-2 rounded-lg ${stats && stats.lowStockAlerts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Package size={20} />
                          </div>
                        </div>
                        <p className={`text-3xl font-bold mt-4 ${stats && stats.lowStockAlerts > 0 ? 'text-red-600' : 'text-black'}`}>
                          {stats?.lowStockAlerts}
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="text-black text-sm ">Staff Members</h3>
                          <div className="p-2 bg-[#E0EEF5] rounded-lg text-[#6899B0]">
                            <UserCircle size={20} />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-black mt-4">{stats?.totalStaff}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </main>
          </>
        ) : (
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store';
import { LogOut, Users, Calendar, LayoutDashboard, Settings, UserCircle, IndianRupee, Package, BarChart2, Activity, HelpCircle, Bell, Building2, ArrowLeft, Beaker, Tag } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from '../api/axios';
import ClinicSwitcher from '../components/ClinicSwitcher';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useFeatureAccess } from '../components/FeatureGate';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  todayAppointments: number;
  monthlyAppointments: number;
  todayRevenue: number;
  monthlyRevenue: number;
  todayNetRevenue: number;
  monthlyNetRevenue: number;
  pendingPayments: number;
  followUpPatients: number;
  lowStockAlerts: number;
}

const mockRevenueData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 59000 },
  { name: 'Jun', revenue: 75000 },
  { name: 'Jul', revenue: 82000 },
];

const mockPatientData = [
  { name: 'Mon', patients: 12 },
  { name: 'Tue', patients: 19 },
  { name: 'Wed', patients: 15 },
  { name: 'Thu', patients: 22 },
  { name: 'Fri', patients: 28 },
  { name: 'Sat', patients: 35 },
  { name: 'Sun', patients: 10 },
];

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const clinicName = useSelector((state: RootState) => state.auth.clinicName);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePlan, setActivePlan] = useState<string>('starter');
    
    const { hasAccess } = useFeatureAccess();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'admin' || user?.role === 'CLINIC_ADMIN';
    const isDoctor = user?.role === 'DOCTOR' || user?.role === 'doctor';
    const isReceptionist = user?.role === 'RECEPTIONIST' || user?.role === 'receptionist';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';
    const isHome = location.pathname === '/';
  
    useEffect(() => {
      const fetchPlan = async () => {
        try {
          const res = await axios.get('/settings/clinic');
          if (res.data?.subscription_plan) {
            setActivePlan(res.data.subscription_plan);
          }
        } catch (error) {
          console.error("Failed to fetch clinic plan", error);
        }
      };
      fetchPlan();

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
        <div className="w-[280px] bg-[oklch(0.78_0.03_206.04)] text-white flex flex-col shadow-2xl shadow-black/10 z-10 overflow-hidden relative">
          
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
  
          <div className="p-6">
            <div className="flex flex-col gap-3 mb-6 relative z-10">
              <div className="w-48 h-auto mb-2 flex items-center shrink-0">
                <img src={user?.clinic?.logo_url || "/logo-white.png"} alt="Clinic Logo" className="max-w-full max-h-[60px] object-contain drop-shadow-md" />
              </div>
              <h2 className="text-[15px] font-extrabold text-white tracking-wide leading-tight line-clamp-2">{clinicName}</h2>
            </div>
            <ClinicSwitcher />
          </div>
        
        <nav className="flex-1 flex flex-col px-4 space-y-1 overflow-y-auto pb-4 mt-4 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link to="/" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${isHome ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <LayoutDashboard size={20} strokeWidth={isHome ? 2.5 : 2} />
            <span>{t('sidebar.dashboard')}</span>
          </Link>
          <Link to="/appointments" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/appointments') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <Calendar size={20} strokeWidth={location.pathname.startsWith('/appointments') ? 2.5 : 2} />
            <span>{t('sidebar.appointments')}</span>
          </Link>
          <Link to="/patients" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/patients') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
            <Users size={20} strokeWidth={location.pathname.startsWith('/patients') ? 2.5 : 2} />
            <span>{t('sidebar.patients')}</span>
          </Link>
          {(isAdmin || isReceptionist) && (
            <Link to="/billing" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/billing') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
              <IndianRupee size={20} strokeWidth={location.pathname.startsWith('/billing') ? 2.5 : 2} />
              <span>{t('sidebar.billing')}</span>
            </Link>
          )}
          {isAdmin && hasAccess('EXPENSES', 'PRO') && (
            <Link to="/expenses" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/expenses') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
              <Tag size={20} strokeWidth={location.pathname.startsWith('/expenses') ? 2.5 : 2} />
              <span>{t('sidebar.expenses')}</span>
            </Link>
          )}
          {isAdmin && hasAccess('INVENTORY', 'PRO') && (
            <Link to="/inventory" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/inventory') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
              <Package size={20} strokeWidth={location.pathname.startsWith('/inventory') ? 2.5 : 2} />
              <span>{t('sidebar.inventory')}</span>
            </Link>
          )}
          {(isAdmin || isDoctor) && hasAccess('LAB_ORDERS', 'ENTERPRISE') && (
            <Link to="/lab-orders" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/lab-orders') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
              <Beaker size={20} strokeWidth={location.pathname.startsWith('/lab-orders') ? 2.5 : 2} />
              <span>{t('sidebar.labOrders')}</span>
            </Link>
          )}

          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest opacity-80">{t('sidebar.personal')}</p>
          </div>
          {(isAdmin || isDoctor) && (
            <Link to="/schedule" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/schedule') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'} w-full text-left`}>
              <Calendar size={20} strokeWidth={location.pathname.startsWith('/schedule') ? 2.5 : 2} />
              <span>{t('sidebar.mySchedule')}</span>
            </Link>
          )}
          <Link to="/notifications" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/notifications') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'} w-full text-left`}>
            <Bell size={20} strokeWidth={location.pathname.startsWith('/notifications') ? 2.5 : 2} />
            <span>{t('sidebar.notifications')}</span>
          </Link>
          {isAdmin && hasAccess('STAFF', 'PRO') && (
            <>
              <div className="pt-4 pb-1.5 px-4">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest opacity-80">{t('sidebar.administration')}</p>
              </div>
              <Link to="/staff" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/staff') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                <UserCircle size={20} strokeWidth={location.pathname.startsWith('/staff') ? 2.5 : 2} />
                <span>{t('sidebar.staffManagement')}</span>
              </Link>
            </>
          )}
          {(isAdmin || isDoctor) && (
            <Link to="/reports" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/reports') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
              <BarChart2 size={20} strokeWidth={location.pathname.startsWith('/reports') ? 2.5 : 2} />
              <span>{t('sidebar.reports')}</span>
            </Link>
          )}
          {isAdmin && (
            <>
              {isSuperAdmin && activePlan === 'enterprise' && (
                <Link to="/manage-clinics" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/manage-clinics') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                  <Building2 size={20} strokeWidth={location.pathname.startsWith('/manage-clinics') ? 2.5 : 2} />
                  <span>{t('sidebar.manageClinics')}</span>
                </Link>
              )}

              <Link to="/settings" className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition-all ${location.pathname.startsWith('/settings') ? 'bg-white/20 text-white font-extrabold shadow-sm' : 'text-white font-bold hover:bg-white/10 hover:text-white  hover:translate-x-1'}`}>
                <Settings size={20} strokeWidth={location.pathname.startsWith('/settings') ? 2.5 : 2} />
                <span>{t('sidebar.settings')}</span>
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
              <span>{t('sidebar.helpSupport')}</span>
            </Link>
            <button 
              onClick={() => dispatch(logout())}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-white font-bold hover:bg-red-500/20 hover:text-red-300 transition-all w-full text-left  hover:translate-x-1"
            >
              <LogOut size={20} strokeWidth={2} />
              <span>{t('sidebar.logout')}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isHome ? (
          <>
            <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">{t('dashboard.title')}</h1>
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <div className="text-sm text-black">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Activity className="animate-spin text-blue-600" size={32} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">{t('dashboard.todaysAppointments')}</h3>
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Calendar size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">{stats?.todayAppointments}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black text-sm ">{t('dashboard.totalPatients')}</h3>
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-black mt-4">{stats?.totalPatients}</p>
                  </div>
                  
                  {isAdmin && (
                    <>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="text-black text-sm ">{t('dashboard.todaysRevenue')} (Gross)</h3>
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <IndianRupee size={20} />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-black mt-4">₹{stats?.todayRevenue}</p>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#6899B0]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="flex justify-between items-start relative z-10">
                          <h3 className="text-black text-sm font-bold">Net Profit (Today)</h3>
                          <div className="p-2 bg-[#6899B0]/10 rounded-lg text-[#6899B0]">
                            <Activity size={20} />
                          </div>
                        </div>
                        <p className={`text-3xl font-black mt-4 relative z-10 ${stats && stats.todayNetRevenue < 0 ? 'text-red-500' : 'text-[#6899B0]'}`}>
                          ₹{stats?.todayNetRevenue}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 relative z-10">After deducting expenses</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="text-black text-sm ">{t('dashboard.pendingPayments')}</h3>
                          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <IndianRupee size={20} />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-black mt-4">₹{stats?.pendingPayments}</p>
                      </div>

                      {/* Inventory and Staff Cards only for Pro/Enterprise */}
                      {hasAccess('INVENTORY', 'PRO') && (
                        <>
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h3 className="text-black text-sm ">{t('dashboard.lowStockAlerts')}</h3>
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
                          <h3 className="text-black text-sm ">{t('dashboard.staffMembers')}</h3>
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <UserCircle size={20} />
                          </div>
                        </div>
                            <p className="text-3xl font-bold text-black mt-4">{stats?.totalStaff}</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Revenue Trend Chart (Available for Admins on Pro/Enterprise) */}
                  {isAdmin && hasAccess('REVENUE_CHART', 'PRO') && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-black">{t('dashboard.revenueGrowth')}</h3>
                        <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 outline-none text-slate-600">
                          <option>This Year</option>
                          <option>Last Year</option>
                        </select>
                      </div>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6899B0" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6899B0" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} />
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6899B0" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Patient Visits Chart */}
                  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${!isAdmin ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-black">{t('dashboard.weeklyFootfall')}</h3>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockPatientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                          <RechartsTooltip 
                            cursor={{ fill: '#F1F5F9' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="patients" fill="#5D8799" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                </>
              )}
            </main>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold"
              >
                <ArrowLeft size={18} /> {t('common.back')}
              </button>
              <LanguageSwitcher />
            </header>
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
              <Outlet />
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

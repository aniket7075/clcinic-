import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import PatientManagement from './pages/PatientManagement';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import LabOrders from './pages/LabOrders';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import MySchedule from './pages/MySchedule';
import Notifications from './pages/Notifications';
import HelpSupport from './pages/HelpSupport';
import ManageClinics from './pages/ManageClinics';
import Expenses from './pages/Expenses';
import PublicBooking from './pages/PublicBooking';
import LandingPage from './pages/LandingPage';
import ActivationScreen from './pages/ActivationScreen';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureGate from './components/FeatureGate';

// System Admin
import SystemAdminLayout from './components/SystemAdminLayout';
import SystemDashboard from './pages/system-admin/SystemDashboard';
import ClinicRequests from './pages/system-admin/ClinicRequests';
import AllClinics from './pages/system-admin/AllClinics';
import SystemSettings from './pages/system-admin/SystemSettings';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // Check if running in Electron (desktop app)
  const isElectron = navigator.userAgent.toLowerCase().includes('electron');
  const defaultUnauthRoute = isElectron ? '/login' : '/welcome';

  return (
    <Router>
      <Routes>
        <Route path="/book/:clinicId" element={<PublicBooking />} />
        <Route 
          path="/welcome" 
          element={!isAuthenticated ? <LandingPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/activate" 
          element={!isAuthenticated ? <ActivationScreen /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'SYSTEM_ADMIN' ? <Navigate to="/system-admin" /> : <Dashboard />
            ) : <Navigate to={defaultUnauthRoute} />
          } 
        >
          {/* Admin & Superadmin only */}
          <Route path="manage-clinics" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN']}><ManageClinics /></ProtectedRoute>} />
          <Route path="staff" element={<FeatureGate minPlan="PRO" feature="STAFF"><ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><StaffManagement /></ProtectedRoute></FeatureGate>} />
          <Route path="expenses" element={<FeatureGate minPlan="PRO" feature="EXPENSES"><ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Expenses /></ProtectedRoute></FeatureGate>} />
          <Route path="inventory" element={<FeatureGate minPlan="PRO" feature="INVENTORY"><ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Inventory /></ProtectedRoute></FeatureGate>} />
          <Route path="audit-logs" element={<FeatureGate minPlan="ENTERPRISE" feature="AUDIT_LOGS"><ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><AuditLogs /></ProtectedRoute></FeatureGate>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Settings /></ProtectedRoute>} />
          
          {/* Admin & Doctor */}
          <Route path="reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><Reports /></ProtectedRoute>} />
          
          {/* Accessible by all authenticated staff */}
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'RECEPTIONIST', 'receptionist']}><Billing /></ProtectedRoute>} />
          <Route path="lab-orders" element={<FeatureGate minPlan="ENTERPRISE" feature="LAB_ORDERS"><ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><LabOrders /></ProtectedRoute></FeatureGate>} />
          <Route path="schedule" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><MySchedule /></ProtectedRoute>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<HelpSupport />} />
        </Route>

        {/* System Admin Routes */}
        <Route 
          path="/system-admin" 
          element={isAuthenticated && user?.role === 'SYSTEM_ADMIN' ? <SystemAdminLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<SystemDashboard />} />
          <Route path="requests" element={<ClinicRequests />} />
          <Route path="clinics" element={<AllClinics />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

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
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/book/:clinicId" element={<PublicBooking />} />
        <Route 
          path="/welcome" 
          element={!isAuthenticated ? <LandingPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/welcome" />} 
        >
          {/* Admin & Superadmin only */}
          <Route path="manage-clinics" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN']}><ManageClinics /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><StaffManagement /></ProtectedRoute>} />
          <Route path="expenses" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Expenses /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Inventory /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><AuditLogs /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin']}><Settings /></ProtectedRoute>} />
          
          {/* Admin & Doctor */}
          <Route path="reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><Reports /></ProtectedRoute>} />
          
          {/* Accessible by all authenticated staff */}
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'RECEPTIONIST', 'receptionist']}><Billing /></ProtectedRoute>} />
          <Route path="lab-orders" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><LabOrders /></ProtectedRoute>} />
          <Route path="schedule" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN', 'CLINIC_ADMIN', 'admin', 'DOCTOR', 'doctor']}><MySchedule /></ProtectedRoute>} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<HelpSupport />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

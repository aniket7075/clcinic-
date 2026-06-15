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
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route path="/book/:clinicId" element={<PublicBooking />} />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        >
          {/* Admin & Superadmin only */}
          <Route path="manage-clinics" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}><ManageClinics /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><StaffManagement /></ProtectedRoute>} />
          <Route path="expenses" element={<ProtectedRoute allowedRoles={['ADMIN']}><Expenses /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><Inventory /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />
          
          {/* Admin & Doctor */}
          <Route path="reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}><Reports /></ProtectedRoute>} />
          
          {/* Accessible by all authenticated staff */}
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="lab-orders" element={<LabOrders />} />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<HelpSupport />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

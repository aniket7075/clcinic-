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
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import MySchedule from './pages/MySchedule';
import Notifications from './pages/Notifications';
import HelpSupport from './pages/HelpSupport';
import ManageClinics from './pages/ManageClinics';

const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        >
          <Route path="manage-clinics" element={<ManageClinics />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<HelpSupport />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

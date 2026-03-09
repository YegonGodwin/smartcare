import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from '@pages/index';
import {
  AdminDashboardPage as DashboardPage,
  AdminDepartmentsPage,
  AdminPatientsPage,
  AdminAppointmentsPage,
  AdminDoctorsPage,
} from '@pages/Admin';
import { PatientApprovalsPage } from '@pages/Admin/PatientApprovalsPage';
import {
  PatientDashboardPage,
  PatientAppointmentsPage,
  PatientRecordsPage,
} from '@pages/Patient';
import {
  DoctorDashboardPage,
  DoctorAppointmentsPage,
  DoctorPatientsPage,
  DoctorRecordsPage,
  DoctorAvailabilityPage,
} from '@pages/Doctor';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin', 'receptionist']} />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/patients" element={<AdminPatientsPage />} />
            <Route path="/admin/approvals" element={<PatientApprovalsPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/records" element={<PatientRecordsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
            <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
            <Route path="/doctor/records" element={<DoctorRecordsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

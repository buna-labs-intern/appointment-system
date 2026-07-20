import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AppointmentsPage from '../pages/AppointmentsPage'
import DashboardPage from '../pages/DashboardPage'
import DoctorsPage from '../pages/DoctorsPage'
import LoginPage from '../pages/LoginPage'
import NotFound from '../pages/NotFound'
import PatientsPage from '../pages/PatientsPage'
import ServicesPage from '../pages/ServicesPage'
import ProtectedRoute from './PrivateRoute'

function UsersPage() {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h3 className="text-lg font-semibold">Receptionists</h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Receptionist management will be implemented here.
      </p>
    </section>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

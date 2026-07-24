import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AppointmentsPage from '@/pages/AppointmentsPage'
import DashboardPage from '@/pages/DashboardPage'
import DoctorsPage from '@/pages/DoctorsPage'
import LoginPage from '@/pages/LoginPage'
import NotFound from '@/pages/NotFound'
import PatientsPage from '@/pages/PatientsPage'
import ServicesPage from '@/pages/ServicesPage'
import UsersPage from '@/pages/UsersPage'
import ProtectedRoute from '@/routes/PrivateRoute'
import RoleRoute from '@/routes/RoleRoute'
import { ROLES } from '@/utils/constants'

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

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

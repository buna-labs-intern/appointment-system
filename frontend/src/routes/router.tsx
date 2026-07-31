import { createBrowserRouter, redirect } from 'react-router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AppointmentsPage from '@/pages/AppointmentsPage'
import DashboardPage from '@/pages/DashboardPage'
import DoctorsPage from '@/pages/DoctorsPage'
import LoginPage from '@/pages/LoginPage'
import NotFound from '@/pages/NotFound'
import PatientsPage from '@/pages/PatientsPage'
import ProfilePage from '@/pages/ProfilePage'
import ReportsPage from '@/pages/ReportsPage'
import ServicesPage from '@/pages/ServicesPage'
import UsersPage from '@/pages/UsersPage'
import ProtectedRoute from '@/routes/PrivateRoute'
import RoleRoute from '@/routes/RoleRoute'
import { ROLES } from '@/utils/constants'

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: ProtectedRoute,
    children: [
      {
        Component: DashboardLayout,
        children: [
          {
            index: true,
            loader: () => redirect('/dashboard'),
          },
          { path: 'dashboard', Component: DashboardPage },
          { path: 'appointments', Component: AppointmentsPage },
          { path: 'patients', Component: PatientsPage },
          { path: 'doctors', Component: DoctorsPage },
          { path: 'services', Component: ServicesPage },
          { path: 'profile', Component: ProfilePage },
          {
            element: <RoleRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [
              { path: 'users', Component: UsersPage },
              { path: 'reports', Component: ReportsPage },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
])

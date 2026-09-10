import { createBrowserRouter, Navigate } from 'react-router'
import RequireAuth from '@/routes/RequireAuth'
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import TenantsPage from '@/pages/TenantsPage'
import CreateTenantPage from '@/pages/CreateTenantPage'
import TenantDetailPage from '@/pages/TenantDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/tenants" replace /> },
          { path: 'tenants', element: <TenantsPage /> },
          { path: 'tenants/new', element: <CreateTenantPage /> },
          { path: 'tenants/:id', element: <TenantDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

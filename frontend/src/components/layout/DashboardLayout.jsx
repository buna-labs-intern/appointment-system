import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { NAV_ITEMS } from '../../utils/constants'

function getPageTitle(pathname) {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path))
  return match?.label || 'Dashboard'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

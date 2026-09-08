import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { store } from '@/app/store'
import { queryClient } from '@/app/queryClient'
import { router } from '@/routes/router'
import ToastHost from '@/components/common/ToastHost'
import { TenantProvider } from '@/features/tenant/TenantContext'

export default function App() {
  return (
    <Provider store={store}>
      <TenantProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ToastHost />
        </QueryClientProvider>
      </TenantProvider>
    </Provider>
  )
}
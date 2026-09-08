import axios from 'axios'
import { AUTH_STORAGE_KEY, TENANT_HEADER } from '@/utils/constants'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const { token, tenant, user } = JSON.parse(raw)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      const tenantId = tenant?.id ?? user?.tenantId
      if (tenantId) {
        config.headers[TENANT_HEADER] = tenantId
      }
    }
  } catch {
    // ignore malformed storage
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    return Promise.reject(error)
  },
)

export default api

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '@/types/api'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export const AUTH_STORAGE_KEY = 'nexacare_admin_auth'

type StoredAuth = {
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: string
    tenantId?: string | null
    mustChangePassword?: boolean
  }
}

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredAuth>
    if (parsed?.token && parsed?.user) return parsed as StoredAuth
    return null
  } catch {
    return null
  }
}

export function writeStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = readStoredAuth()
  if (stored?.token) {
    config.headers.Authorization = `Bearer ${stored.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredAuth()
    }
    return Promise.reject(error)
  },
)

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string } | undefined
    return payload?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export async function apiGet<T>(url: string, params?: Record<string, string | number | undefined>): Promise<ApiEnvelope<T>> {
  const { data } = await api.get<ApiEnvelope<T>>(url, { params })
  return data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const { data } = await api.post<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const { data } = await api.put<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const { data } = await api.patch<ApiEnvelope<T>>(url, body)
  return data
}

export async function apiDelete<T>(url: string): Promise<ApiEnvelope<T>> {
  const { data } = await api.delete<ApiEnvelope<T>>(url)
  return data
}

export default api

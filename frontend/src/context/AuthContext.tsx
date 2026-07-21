import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { AUTH_STORAGE_KEY } from '../utils/constants'

const AuthContext = createContext(null)

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = readStoredAuth()
    if (stored?.user && stored?.token) {
      setUser(stored.user)
      setToken(stored.token)
    }
    setLoading(false)
  }, [])

  const login = useCallback((authUser, authToken) => {
    const payload = { user: authUser, token: authToken }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    setUser(authUser)
    setToken(authToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

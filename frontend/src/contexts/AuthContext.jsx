/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await api.get('/user')
        setUser(response.data)
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('token')
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const logout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await api.post('/logout')
    } catch (error) {
      // Ignore errors
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setIsLoggingOut(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isLoggingOut, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}


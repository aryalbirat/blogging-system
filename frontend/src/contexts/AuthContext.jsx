import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      toast.success('🎉 Welcome back! Login successful!')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      
      // Provide specific error messages for better UX
      if (errorMessage.includes('Invalid credentials')) {
        toast.error('🔐 Invalid email or password. Please check your credentials and try again.')
      } else if (errorMessage.includes('User not found')) {
        toast.error('👤 No account found with this email address. Please register first.')
      } else if (error.response?.status === 401) {
        toast.error('🔒 Access denied. Please check your login credentials.')
      } else {
        toast.error(`❌ Login failed: ${errorMessage}`)
      }
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      toast.success('Welcome to BlogSystem! Your account has been created successfully!')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      
      // Provide specific error messages for better UX
      if (errorMessage.includes('User with this email already exists')) {
        toast.error('⚠️ Account already exists! An account with this email address is already registered. Please try logging in instead.')
      } else if (errorMessage.includes('email')) {
        toast.error('❌ Invalid email format. Please enter a valid email address.')
      } else if (errorMessage.includes('password')) {
        toast.error('🔒 Password too weak. Password must be at least 6 characters long.')
      } else if (errorMessage.includes('phone')) {
        toast.error('📱 Invalid phone number. Please enter a valid phone number.')
      } else if (errorMessage.includes('validation')) {
        toast.error('⚠️ Please check your information and ensure all required fields are filled correctly.')
      } else {
        toast.error(`❌ Registration failed: ${errorMessage}`)
      }
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAuthor: user?.userType === 'author',
    isReader: user?.userType === 'reader'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

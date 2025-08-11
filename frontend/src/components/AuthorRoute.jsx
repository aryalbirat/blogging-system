import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthorRoute = () => {
  const { isAuthenticated, isAuthor, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (!isAuthor) {
    return <Navigate to="/dashboard" />
  }

  return <Outlet />
}

export default AuthorRoute

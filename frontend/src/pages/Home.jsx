import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, FileText, Plus } from 'lucide-react'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-8">
            Welcome to{' '}
            <span className="text-primary-600">BlogSystem</span>
          </h1>
          <p className="max-w-md mx-auto text-base text-gray-500 sm:text-lg md:text-xl md:max-w-3xl mb-12">
            A modern blogging platform where authors can create engaging content and readers can discover, like, and comment on amazing blog posts.
          </p>
          
          {isAuthenticated ? (
            <div className="mb-24">
              <p className="text-lg text-gray-600 mb-8">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/dashboard"
                  className="btn btn-primary inline-flex items-center"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
                <Link
                  to="/blogs"
                  className="btn btn-secondary inline-flex items-center"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Browse Public Blogs
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-24">
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/register"
                  className="btn btn-primary inline-flex items-center"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary inline-flex items-center"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-6">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Blogs</h3>
              <p className="text-base text-gray-500">
                Authors can create and manage their own blog posts with rich content.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-6">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
              <p className="text-base text-gray-500">
                Two user types: Authors who create content and Readers who engage with posts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-6">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Engage & Interact</h3>
              <p className="text-base text-gray-500">
                Like and comment on blog posts to show your appreciation and start discussions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { 
  Users, 
  FolderOpen, 
  FileText, 
  Heart, 
  MessageCircle,
  Plus,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthor } = useAuth()

  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const [usersRes, categoriesRes, blogsRes] = await Promise.all([
      api.get('/users?limit=1'),
      api.get('/categories?limit=1'),
      api.get('/blogs?limit=1')
    ])
    
    return {
      users: usersRes.data.pagination.totalUsers,
      categories: categoriesRes.data.pagination.totalCategories,
      blogs: blogsRes.data.pagination.totalBlogs
    }
  })

  const { data: myBlogs } = useQuery(
    'my-blogs-stats',
    async () => {
      if (!isAuthor) return { blogs: 0, totalLikes: 0, totalComments: 0 }
      const response = await api.get('/blogs/author/my-blogs?limit=1')
      return {
        blogs: response.data.pagination.totalBlogs,
        totalLikes: response.data.blogs.reduce((sum, blog) => sum + blog._count.likes, 0),
        totalComments: response.data.blogs.reduce((sum, blog) => sum + blog._count.comments, 0)
      }
    },
    { enabled: isAuthor }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.firstName} {user?.lastName}! Here's what's happening in your blogging system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.users || 0}</p>
            </div>
          </div>
        </div>

        {isAuthor && (
          <>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Categories</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.categories || 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Blogs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.blogs || 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Blogs</p>
                  <p className="text-2xl font-semibold text-gray-900">{myBlogs?.blogs || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Author Stats */}
      {isAuthor && myBlogs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Likes</p>
                <p className="text-2xl font-semibold text-gray-900">{myBlogs.totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{myBlogs.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Engagement</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {myBlogs.blogs > 0 
                    ? Math.round((myBlogs.totalLikes + myBlogs.totalComments) / myBlogs.blogs)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Users</span>
          </Link>

          <Link
            to="/blogs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Public Blogs</span>
          </Link>

          {isAuthor && (
            <>
              <Link
                to="/dashboard/categories"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Categories</span>
              </Link>

              <Link
                to="/dashboard/blogs"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Manage Blogs</span>
              </Link>

              <Link
                to="/dashboard/blogs/create"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create New Blog</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

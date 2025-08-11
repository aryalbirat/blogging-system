import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

const MyBlogs = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [limit] = useState(10)

  const { data: blogs, isLoading } = useQuery(
    ['my-blogs', page, limit, search, startDate, endDate, status],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (search) params.append('search', search)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (status) params.append('status', status)
      
      const response = await api.get(`/blogs/author/my-blogs?${params}`)
      return response.data
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleFilter = () => {
    setPage(1)
  }

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/blogs/${blogId}`)
        // Refetch blogs
        window.location.reload()
      } catch (error) {
        console.error('Error deleting blog:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
          <p className="mt-2 text-gray-600">
            Manage your blog posts and track their performance
          </p>
        </div>
        <Link
          to="/dashboard/blogs/create"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Blog
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your blogs..."
                className="input pl-10"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input pl-10"
                placeholder="Start date"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input pl-10"
                placeholder="End date"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Stats */}
      {blogs?.blogs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Blogs</p>
                <p className="text-2xl font-semibold text-gray-900">{blogs.pagination.totalBlogs}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Likes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {blogs.blogs.reduce((sum, blog) => sum + blog._count.likes, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Comments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {blogs.blogs.reduce((sum, blog) => sum + blog._count.comments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                  Blog
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs?.blogs?.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {blog.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {blog.body.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{blog.category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Heart className="h-4 w-4 mr-1" />
                        {blog._count.likes}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {blog._count.comments}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/blogs/${blog.id}`}
                        className="text-primary-600 hover:text-primary-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/dashboard/blogs/${blog.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {blogs?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!blogs.pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!blogs.pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {((blogs.pagination.currentPage - 1) * limit) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(blogs.pagination.currentPage * limit, blogs.pagination.totalBlogs)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{blogs.pagination.totalBlogs}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!blogs.pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {blogs.pagination.currentPage} of {blogs.pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!blogs.pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBlogs

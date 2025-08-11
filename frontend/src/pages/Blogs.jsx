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
  User,
  Calendar,
  FolderOpen,
  Edit,
  Trash2
} from 'lucide-react'

const Blogs = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [limit] = useState(10)

  const { data: blogs, isLoading } = useQuery(
    ['blogs', page, limit, search, categoryId, status],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (search) params.append('search', search)
      if (categoryId) params.append('categoryId', categoryId)
      if (status) params.append('status', status)
      
      const response = await api.get(`/blogs?${params}`)
      return response.data
    }
  )

  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories')
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
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="mt-2 text-gray-600">
            Manage all blog posts in the system
          </p>
        </div>
        <Link
          to="/dashboard/blogs/create"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Blog
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blogs..."
                className="input pl-10"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input pl-10"
              >
                <option value="">All Categories</option>
                {categories?.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

      {/* Blogs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                  Blog
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Author
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
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
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {blog.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {blog.body.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {blog.creator.firstName.charAt(0)}{blog.creator.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {blog.creator.firstName} {blog.creator.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 text-gray-400 mr-2" />
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
                        to={`/dashboard/blogs/${blog.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/dashboard/blogs/${blog.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
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

export default Blogs

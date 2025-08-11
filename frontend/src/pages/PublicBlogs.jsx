import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  User,
  Calendar,
  FolderOpen
} from 'lucide-react'

const PublicBlogs = () => {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [limit] = useState(12)

  const { data: blogs, isLoading: blogsLoading } = useQuery(
    ['public-blogs', page, limit, search, categoryId],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (search) params.append('search', search)
      if (categoryId) params.append('categoryId', categoryId)
      
      const response = await api.get(`/public/blogs?${params}`)
      return response.data
    }
  )

  const { data: categories } = useQuery(
    'public-categories',
    async () => {
      const response = await api.get('/public/categories')
      return response.data
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value)
    setPage(1)
  }

  const handleLike = async (blogId) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return
    }
    
    try {
      await api.post(`/blogs/${blogId}/like`)
      // Refetch blogs to update like count
      window.location.reload()
    } catch (error) {
      console.error('Error liking blog:', error)
    }
  }

  if (blogsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Public Blogs</h1>
        <p className="mt-2 text-gray-600">
          Discover amazing blog posts from our community of authors
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onChange={handleCategoryChange}
                className="input pl-10"
              >
                <option value="">All Categories</option>
                {categories?.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count.blogs})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Blogs Grid */}
      {blogs?.blogs?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.blogs.map((blog) => (
            <div key={blog.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{blog.category.name}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  <Link 
                    to={`/blogs/${blog.id}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {blog.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.body.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>
                      {blog.creator.firstName} {blog.creator.lastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        isAuthenticated 
                          ? 'text-red-500 hover:text-red-700' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <Heart className="h-4 w-4" />
                      <span>{blog._count.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{blog._count.comments}</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/blogs/${blog.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-500">
            {search || categoryId 
              ? 'Try adjusting your search criteria' 
              : 'No blogs have been published yet'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {blogs?.pagination && blogs.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!blogs.pagination.hasPrevPage}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {blogs.pagination.currentPage} of {blogs.pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={!blogs.pagination.hasNextPage}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default PublicBlogs

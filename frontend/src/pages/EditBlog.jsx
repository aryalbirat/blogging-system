import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { 
  ArrowLeft, 
  FileText,
  FolderOpen
} from 'lucide-react'

const EditBlog = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: blog, isLoading: blogLoading } = useQuery(
    ['blog', id],
    async () => {
      const response = await api.get(`/blogs/${id}`)
      return response.data.blog
    }
  )

  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories')
      return response.data
    }
  )

  const updateBlogMutation = useMutation(
    async (data) => {
      const response = await api.put(`/blogs/${id}`, data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blog', id])
        queryClient.invalidateQueries(['blogs'])
        toast.success('Blog updated successfully!')
        navigate('/dashboard/blogs')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update blog')
      }
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm()

  // Pre-fill form when blog data is loaded
  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        body: blog.body,
        categoryId: blog.categoryId,
        status: blog.status
      })
    }
  }, [blog, reset])

  const onSubmit = (data) => {
    updateBlogMutation.mutate(data)
  }

  if (blogLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
        <p className="text-gray-600 mb-6">The blog you're trying to edit doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/dashboard/blogs')}
          className="btn btn-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
          <p className="mt-2 text-gray-600">
            Update your blog post and make it even better
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/blogs')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </button>
      </div>

      {/* Edit Blog Form */}
      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              {...register('title', { 
                required: 'Blog title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters'
                }
              })}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter your blog title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className={`input pl-10 ${errors.categoryId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories?.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Content *
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                {...register('body', { 
                  required: 'Blog content is required',
                  minLength: {
                    value: 10,
                    message: 'Content must be at least 10 characters'
                  }
                })}
                rows={12}
                className={`input pl-10 ${errors.body ? 'border-red-500' : ''}`}
                placeholder="Write your blog content here..."
              />
            </div>
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {watch('body')?.length || 0} characters
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className={`input ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="">Select status</option>
              <option value="ACTIVE">Active - Publish immediately</option>
              <option value="INACTIVE">Inactive - Save as draft</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={updateBlogMutation.isLoading}
              className="btn btn-primary flex-1"
            >
              {updateBlogMutation.isLoading ? 'Updating...' : 'Update Blog'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/blogs')}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Current Blog Info */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Current Blog Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900">Created:</span>
            <span className="text-blue-800 ml-2">
              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Last Updated:</span>
            <span className="text-blue-800 ml-2">
              {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Likes:</span>
            <span className="text-blue-800 ml-2">{blog._count?.likes || 0}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Comments:</span>
            <span className="text-blue-800 ml-2">{blog._count?.comments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditBlog

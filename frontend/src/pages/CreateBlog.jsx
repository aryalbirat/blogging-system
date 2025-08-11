import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { 
  ArrowLeft, 
  FileText,
  FolderOpen
} from 'lucide-react'

const CreateBlog = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/categories')
      return response.data
    }
  )

  const createBlogMutation = useMutation(
    async (data) => {
      const response = await api.post('/blogs', data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blogs'])
        toast.success('Blog created successfully!')
        navigate('/dashboard/blogs')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create blog')
      }
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const onSubmit = (data) => {
    createBlogMutation.mutate(data)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
          <p className="mt-2 text-gray-600">
            Share your thoughts and ideas with the community
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

      {/* Create Blog Form */}
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
              disabled={createBlogMutation.isLoading}
              className="btn btn-primary flex-1"
            >
              {createBlogMutation.isLoading ? 'Creating...' : 'Create Blog'}
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

      {/* Tips */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Writing Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Write a compelling title that grabs attention</li>
          <li>• Use clear, concise language</li>
          <li>• Break up content with paragraphs for readability</li>
          <li>• Choose the appropriate category for better discoverability</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateBlog

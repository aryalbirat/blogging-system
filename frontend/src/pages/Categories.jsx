import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  MessageCircle
} from 'lucide-react'

const Categories = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['categories', page, limit],
    async () => {
      const response = await api.get(`/categories?page=${page}&limit=${limit}`)
      return response.data
    }
  )

  const createMutation = useMutation(
    async (categoryData) => {
      const response = await api.post('/categories', categoryData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        toast.success('Category created successfully!')
        setShowForm(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create category')
      }
    }
  )

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/categories/${id}`, data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        toast.success('Category updated successfully!')
        setEditingCategory(null)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update category')
      }
    }
  )

  const deleteMutation = useMutation(
    async (id) => {
      await api.delete(`/categories/${id}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        toast.success('Category deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete category')
      }
    }
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const onSubmit = (data) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      status: category.status
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading categories: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">
            Manage blog categories and view statistics
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCategory(null)
            reset()
          }}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Category name is required' })}
                className={`input mt-1 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className={`input mt-1 ${errors.status ? 'border-red-500' : ''}`}
              >
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="btn btn-primary"
              >
                {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Statistics
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
              {data?.categories?.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Heart className="h-4 w-4 mr-1" />
                        {category.totalLikes || 0}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {category.totalComments || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(category.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
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
        {data?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasNextPage}
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
                    {((data.pagination.currentPage - 1) * limit) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(data.pagination.currentPage * limit, data.pagination.totalCategories)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{data.pagination.totalCategories}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!data.pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
                    .filter(pageNum => 
                      pageNum === 1 || 
                      pageNum === data.pagination.totalPages || 
                      Math.abs(pageNum - data.pagination.currentPage) <= 1
                    )
                    .map((pageNum, index, array) => (
                      <div key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === data.pagination.currentPage
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    ))}
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!data.pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
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

export default Categories

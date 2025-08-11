import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  User, 
  Calendar,
  FolderOpen,
  Send,
  Edit,
  Trash2
} from 'lucide-react'

const BlogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [showCommentForm, setShowCommentForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: blog, isLoading } = useQuery(
    ['blog', id],
    async () => {
      const response = await api.get(`/blogs/${id}`)
      return response.data.blog
    }
  )

  const likeMutation = useMutation(
    async () => {
      const response = await api.post(`/blogs/${id}/like`)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blog', id])
        toast.success('Blog liked successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to like blog')
      }
    }
  )

  const commentMutation = useMutation(
    async (commentData) => {
      const response = await api.post(`/blogs/${id}/comments`, commentData)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blog', id])
        toast.success('Comment added successfully!')
        setShowCommentForm(false)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add comment')
      }
    }
  )

  const deleteMutation = useMutation(
    async () => {
      await api.delete(`/blogs/${id}`)
    },
    {
      onSuccess: () => {
        toast.success('Blog deleted successfully!')
        navigate('/dashboard/blogs')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete blog')
      }
    }
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like this blog')
      return
    }
    likeMutation.mutate()
  }

  const handleComment = (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment on this blog')
      return
    }
    commentMutation.mutate(data)
    reset()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteMutation.mutate()
    }
  }

  const isLiked = blog?.likes?.some(like => like.user.id === user?.id)
  const isAuthor = blog?.creator?.id === user?.id

  if (isLoading) {
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
        <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/blogs" className="btn btn-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        to="/dashboard/blogs" 
        className="inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blogs
      </Link>

      {/* Blog Header */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">{blog.category.name}</span>
          </div>
          
          {isAuthor && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/dashboard/blogs/${id}/edit`}
                className="btn btn-secondary btn-sm"
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>
                {blog.creator.firstName} {blog.creator.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(blog.createdAt), 'MMMM dd, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={likeMutation.isLoading}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : isAuthenticated 
                    ? 'text-gray-500 hover:text-red-500' 
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{blog._count.likes}</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500">
              <MessageCircle className="h-5 w-5" />
              <span>{blog._count.comments}</span>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {blog.body}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({blog._count.comments})
        </h3>

        {/* Add Comment */}
        {isAuthenticated ? (
          <div className="mb-8">
            {!showCommentForm ? (
              <button
                onClick={() => setShowCommentForm(true)}
                className="btn btn-primary"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Add Comment
              </button>
            ) : (
              <form onSubmit={handleSubmit(handleComment)} className="space-y-4">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Comment
                  </label>
                  <textarea
                    {...register('content', { 
                      required: 'Comment content is required',
                      minLength: {
                        value: 1,
                        message: 'Comment cannot be empty'
                      }
                    })}
                    rows={4}
                    className={`input ${errors.content ? 'border-red-500' : ''}`}
                    placeholder="Share your thoughts..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={commentMutation.isLoading}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {commentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentForm(false)
                      reset()
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Please{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                login
              </Link>
              {' '}to add a comment.
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {blog.comments?.length > 0 ? (
            blog.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {comment.user.firstName.charAt(0)}{comment.user.lastName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogDetail

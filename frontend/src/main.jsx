import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AuthorRoute from './components/AuthorRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Categories from './pages/Categories'
import Blogs from './pages/Blogs'
import CreateBlog from './pages/CreateBlog'
import EditBlog from './pages/EditBlog'
import BlogDetail from './pages/BlogDetail'
import PublicBlogs from './pages/PublicBlogs'
import PublicBlogDetail from './pages/PublicBlogDetail'
import MyBlogs from './pages/MyBlogs'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider><Outlet /></AuthProvider>}>
      {/* Public Routes */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="blogs" element={<PublicBlogs />} />
        <Route path="blogs/:id" element={<PublicBlogDetail />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          
          {/* Author-only routes */}
          <Route element={<AuthorRoute />}>
            <Route path="categories" element={<Categories />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/create" element={<CreateBlog />} />
            <Route path="blogs/:id/edit" element={<EditBlog />} />
            <Route path="blogs/:id" element={<BlogDetail />} />
            <Route path="my-blogs" element={<MyBlogs />} />
          </Route>
        </Route>
      </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider 
        router={router} 
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)

# Blogging System

A modern full-stack blogging platform built with React, Node.js, Express, MySQL, and Prisma. Features user authentication, role-based access control, blog management, and interactive commenting system.

## ✨ Features

- **User Management**: JWT authentication with Author/Reader roles
- **Blog Management**: CRUD operations
- **Category System**: Organized blog categorization with statistics
- **Public Views**: Browse blogs without authentication
- **Interactions**: Like and comment system
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js - Server framework
- MySQL - Database
- Prisma - ORM and database toolkit
- JWT - Authentication
- bcryptjs - Password hashing
- express-validator - Input validation
- Helmet - Security middleware
- Morgan - HTTP request logging

**Frontend:**
- React 18 - UI library
- Vite - Build tool and dev server
- React Router - Client-side routing
- React Query - Data fetching and state management
- React Hook Form - Form handling
- Tailwind CSS - Utility-first CSS framework
- Lucide React - Modern icon library
- React Hot Toast - Notifications
- React Markdown - Markdown rendering
- Axios - HTTP client

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd blogging-system
   npm run install:all
   ```

2. **Setup Database**
   ```bash
   # Create MySQL database: blogging_system
   cd backend
   cp env.example .env
   # Update .env with your database credentials
   npx prisma generate
   npx prisma db push
   ```

3. **Run Application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or run separately:
   # Backend (port 5000)
   npm run dev:backend
   
   # Frontend (port 3000) 
   npm run dev:frontend
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   
## 📁 Project Structure

```
blogging-system/
├── backend/                    # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Database seeding
│   │   └── dev.db             # SQLite database file
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management
│   │   ├── categories.js      # Category CRUD
│   │   ├── blogs.js           # Blog management
│   │   └── public.js          # Public API endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── utils/
│   │   ├── database.js        # Prisma client
│   │   ├── jwt.js             # JWT utilities
│   │   ├── pagination.js      # Pagination helper
│   │   ├── validators.js      # Input validation
│   │   └── handleValidation.js
│   ├── server.js              # Express server setup
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Main layout component
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AuthorRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── Login.jsx      # User login
│   │   │   ├── Register.jsx   # User registration
│   │   │   ├── Dashboard.jsx  # User dashboard
│   │   │   ├── Users.jsx      # User management
│   │   │   ├── Categories.jsx # Category management
│   │   │   ├── Blogs.jsx      # Blog management
│   │   │   ├── CreateBlog.jsx # Create new blog
│   │   │   ├── EditBlog.jsx   # Edit existing blog
│   │   │   ├── BlogDetail.jsx # Blog detail view
│   │   │   ├── MyBlogs.jsx    # Author's blog list
│   │   │   ├── PublicBlogs.jsx # Public blog listing
│   │   │   └── PublicBlogDetail.jsx
│   │   ├── utils/
│   │   │   └── api.js         # Axios configuration
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json
├── package.json               # Root package configuration
├── .gitignore
└── README.md
```

## � API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get current user profile | Protected |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users (paginated) | Protected |
| GET | `/api/users/:id` | Get user by ID | Protected |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/categories` | Create category | Authors Only |
| GET | `/api/categories` | Get all categories with stats | Protected |
| GET | `/api/categories/:id` | Get category by ID | Protected |
| PUT | `/api/categories/:id` | Update category | Authors Only |
| DELETE | `/api/categories/:id` | Delete category | Authors Only |

### Blogs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/blogs` | Create blog | Authors Only |
| GET | `/api/blogs` | Get all blogs (paginated) | Protected |
| GET | `/api/blogs/:id` | Get blog by ID | Protected |
| PUT | `/api/blogs/:id` | Update blog | Author (Own blogs) |
| DELETE | `/api/blogs/:id` | Delete blog | Author (Own blogs) |
| GET | `/api/blogs/author/my-blogs` | Get author's blogs | Authors Only |
| POST | `/api/blogs/:id/like` | Like/unlike blog | Protected |
| POST | `/api/blogs/:id/comments` | Add comment | Protected |
| GET | `/api/blogs/:id/comments` | Get blog comments | Protected |

### Public Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/public/blogs` | Get public blogs | Public |
| GET | `/api/public/blogs/:id` | Get public blog detail | Public |
| GET | `/api/public/categories` | Get public categories | Public |

## 🗄️ Database Schema

### Core Models

**Users**
- Authentication and profile information
- User types: `AUTHOR` or `READER`
- Required fields: firstName, lastName, dob, email, phoneNo, password

**Categories**
- Blog categorization system
- Only authors can create/manage categories
- Status: `ACTIVE` or `INACTIVE`

**Blogs**
- Blog posts with title and body
- Linked to categories and creators
- Status management for publishing control

**Likes & Comments**
- User interaction system
- Like/unlike functionality
- Comment threads on blog posts

## 🔐 Environment Configuration

Create `backend/.env`:
```env
# Database Configuration
DATABASE_URL="mysql://blog_user:blog_pass123@localhost:3306/blogging_system"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 👥 User Roles & Access

### Authors
- Create, edit, and delete their own blog posts
- Manage blog categories
- View analytics and statistics
- Access to author dashboard

### Readers
- Browse and read all public blog posts
- Like and comment on posts
- User profile management
- Access to reader dashboard

## 🚀 Development Scripts

```bash
# Install all dependencies
npm run install:all

# Start both servers in development
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# Start production server
npm start
```

## 🎨 Key Features

### Frontend Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Form Validation**: Client-side validation with React Hook Form
- **Loading States**: Proper loading indicators and error handling
- **Route Protection**: Private routes based on authentication and roles
- **Modern UI**: Clean, professional interface with Lucide icons

### Backend Features
- **Security**: Helmet middleware, CORS configuration, input validation
- **Authentication**: JWT-based with role-based access control
- **Pagination**: Efficient data loading with pagination support
- **Error Handling**: Comprehensive error handling and logging
- **Database**: Prisma ORM with MySQL for robust data management

## 🚀 Production Deployment

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- npm or yarn

### Backend Deployment
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm start
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with a static file server
```


**Live Ports**: Backend (5000) | Frontend (3000)  
**Database**: MySQL with Prisma ORM  
**Authentication**: JWT with role-based access control

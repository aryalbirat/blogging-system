const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAuthor } = require('../middleware/auth');
const prisma = require('../utils/database');
const { parsePagination } = require('../utils/pagination');
const { handleValidation } = require('../utils/handleValidation');

const router = express.Router();

// Create blog (Authors only)
router.post('/', authenticateToken, requireAuthor, [
  body('title').trim().isLength({ min: 1 }).withMessage('Blog title is required'),
  body('body').trim().isLength({ min: 10 }).withMessage('Blog body must be at least 10 characters'),
  body('categoryId').isString().trim().isLength({ min: 1 }).withMessage('Valid category ID is required'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { title, body, categoryId, status } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        body,
        status,
        categoryId,
        createdBy: req.user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Get all blogs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const categoryId = req.query.categoryId;
    const status = req.query.status;
    const search = req.query.search;

    const where = {
      status: 'ACTIVE'
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { body: { contains: search } }
      ];
    }

    const blogs = await prisma.blog.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalBlogs = await prisma.blog.count({ where });
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Get author's blogs with date range filter
router.get('/author/my-blogs', authenticateToken, requireAuthor, async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const status = req.query.status;

    const where = {
      createdBy: req.user.id
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (status) {
      where.status = status;
    }

    const blogs = await prisma.blog.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalBlogs = await prisma.blog.count({ where });
    const totalPages = Math.ceil(totalBlogs / limit);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching author blogs:', error);
    res.status(500).json({ error: 'Failed to fetch author blogs' });
  }
});

// Update blog (Author only - their own blogs)
router.put('/:id', authenticateToken, requireAuthor, [
  body('title').trim().isLength({ min: 1 }).withMessage('Blog title is required'),
  body('body').trim().isLength({ min: 10 }).withMessage('Blog body must be at least 10 characters'),
  body('categoryId').isString().trim().isLength({ min: 1 }).withMessage('Valid category ID is required'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const { title, body, categoryId, status } = req.body;

    // Check if blog exists and belongs to the author
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (existingBlog.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own blogs' });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const updateData = {
      title,
      body,
      categoryId,
      status
    };

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete blog (Author only - their own blogs)
router.delete('/:id', authenticateToken, requireAuthor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists and belongs to the author
    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (existingBlog.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own blogs' });
    }

    await prisma.blog.delete({
      where: { id }
    });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Like/Unlike blog
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if user already liked the blog
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: req.user.id,
          blogId: id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_blogId: {
            userId: req.user.id,
            blogId: id
          }
        }
      });

      res.json({ message: 'Blog unliked successfully', liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: req.user.id,
          blogId: id
        }
      });

      res.json({ message: 'Blog liked successfully', liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Add comment to blog
router.post('/:id/comments', authenticateToken, [
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const { content } = req.body;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        blogId: id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get blog comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { blogId: id },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalComments = await prisma.comment.count({
      where: { blogId: id }
    });

    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;

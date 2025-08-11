const express = require('express');
const prisma = require('../utils/database');
const { parsePagination } = require('../utils/pagination');

const router = express.Router();

// Get all public blogs with pagination and filters
router.get('/blogs', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const categoryId = req.query.categoryId;
    const search = req.query.search;

    const where = {
      status: 'ACTIVE'
    };

    if (categoryId) {
      where.categoryId = categoryId;
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
    console.error('Error fetching public blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get public blog by ID
router.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;

  const blog = await prisma.blog.findFirst({
      where: { 
        id,
        status: 'ACTIVE'
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
            id: true,
            firstName: true,
            lastName: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
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
    console.error('Error fetching public blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Get all categories for public view
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            blogs: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching public categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;

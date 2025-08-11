const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAuthor } = require('../middleware/auth');
const prisma = require('../utils/database');
const { parsePagination } = require('../utils/pagination');
const { handleValidation } = require('../utils/handleValidation');

const router = express.Router();

// Create category (Authors only)
router.post('/', authenticateToken, requireAuthor, [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { name, status } = req.body;

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        status,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get all categories with statistics (Prisma, SQLite-safe)
router.get('/', async (req, res) => {
  try {
    const { page, limit, skip: offset } = parsePagination(req.query);

    const [categoriesRaw, totalCategories] = await Promise.all([
      prisma.category.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.category.count(),
    ]);

    // Compute likes/comments per category (OK for small limits like dashboard stats)
    const categories = await Promise.all(
      categoriesRaw.map(async (c) => {
        const [totalLikes, totalComments] = await Promise.all([
          prisma.like.count({ where: { blog: { is: { categoryId: c.id } } } }),
          prisma.comment.count({ where: { blog: { is: { categoryId: c.id } } } }),
        ]);
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          createdAt: c.createdAt,
          createdBy: `${c.creator?.firstName ?? ''} ${c.creator?.lastName ?? ''}`.trim(),
          totalLikes,
          totalComments,
        };
      })
    );

    const totalPages = Math.ceil(totalCategories / limit) || 1;

    res.json({
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Update category (Authors only)
router.put('/:id', authenticateToken, requireAuthor, [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { id } = req.params;
    const { name, status } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if name already exists (excluding current category)
    const nameExists = await prisma.category.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (nameExists) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        status
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (Authors only)
router.delete('/:id', authenticateToken, requireAuthor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has blogs
    const blogsCount = await prisma.blog.count({
      where: { categoryId: id }
    });

    if (blogsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has blogs. Please delete or move the blogs first.' 
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;

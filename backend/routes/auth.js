const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/database');
const { signToken } = require('../utils/jwt');
const { registerValidators, loginValidators } = require('../utils/validators');
const { handleValidation } = require('../utils/handleValidation');

const router = express.Router();

// Register user
router.post('/register', registerValidators, async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { firstName, middleName, lastName, dob, email, phoneNo, password, userType } = req.body;
    const normalizedEmail = String(email).toLowerCase().trim();
    const trimmedPhoneNo = String(phoneNo).trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });


    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        dob: new Date(dob),
        email: normalizedEmail,
        phoneNo: trimmedPhoneNo,
        password: hashedPassword,
        userType
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = signToken({ userId: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});



// Login user
router.post('/login', loginValidators, async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;

    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = signToken({ userId: user.id });

    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});



// Get current user profile (reuse auth middleware)
const { authenticateToken } = require('../middleware/auth');
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

module.exports = router;

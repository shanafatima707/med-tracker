const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');   // adjust path if your models folder is named differently

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('Register route hit');                    // Should appear in terminal

  try {
    console.log('req.body received:', req.body);        // Confirm body is parsed

    const { name, email, password } = req.body;

    console.log('Destructured fields:', { name, email }); // No password for safety

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Checking for existing user with email:', email);
    let user = await User.findOne({ email });

    if (user) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Generating salt and hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating new User document...');
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    console.log('Saving user to MongoDB Atlas...');
    await user.save();

    console.log('User saved successfully! ID:', user._id);

    // Success response - never send password back
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('Register error details:', err.stack || err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message || 'Unknown error during registration'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login route hit');

  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    console.log('Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Password correct → create JWT
    console.log('Password correct - generating JWT');

    const payload = {
      user: {
        id: user.id,          // or user._id
        email: user.email,
        name: user.name
      }
    };

    // Sign token - expires in 7 days (you can change to 1h for stricter security)
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret_key_very_long_and_random', 
      { expiresIn: '7d' }
    );

    console.log('JWT generated');

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: err.message 
    });
  }
});
module.exports = router;
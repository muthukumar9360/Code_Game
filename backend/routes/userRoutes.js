import express from 'express';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// Hash password helper
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Create/Signup new user
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      passwordHash: hashPassword(password)
    });

    await newUser.save();
    console.log('✅ User created:', username);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        tier: newUser.tier
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User logged in:', email);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tier: user.tier,
        xp: user.xp,
        coins: user.coins
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, tier, xp, coins } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, tier, xp, coins, lastActive: new Date() },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User updated:', req.params.id);
    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error('❌ Update error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User deleted:', req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

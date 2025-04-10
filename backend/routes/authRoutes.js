const express = require('express');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    res.json({ message: 'Register user' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    res.json({ message: 'Login user' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../database/db');

const router = express.Router();

// Get leaderboard
router.get('/', auth, async (req, res) => {
  const { type = 'all' } = req.query; // weekly, monthly, all

  try {
    let query = 'SELECT l.*, u.name FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY l.points DESC';
    if (type === 'weekly') {
      query = 'SELECT l.*, u.name FROM leaderboard l JOIN users u ON l.user_id = u.id WHERE l.updated_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK) ORDER BY l.points DESC';
    } else if (type === 'monthly') {
      query = 'SELECT l.*, u.name FROM leaderboard l JOIN users u ON l.user_id = u.id WHERE l.updated_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) ORDER BY l.points DESC';
    }

    const [rows] = await pool.execute(query);
    res.json({ leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user points (for answering doubts, etc.)
router.post('/update-points', auth, async (req, res) => {
  const { points } = req.body;
  const userId = req.user.user.id;

  try {
    await pool.execute(
      'INSERT INTO leaderboard (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + VALUES(points), updated_at = NOW()',
      [userId, points]
    );
    res.json({ message: 'Points updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../database/db');

const router = express.Router();

// Get doubts
router.get('/doubts', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT cd.*, u.name as user_name FROM community_doubts cd JOIN users u ON cd.user_id = u.id ORDER BY cd.created_at DESC'
    );
    res.json({ doubts: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post doubt
router.post('/doubt', auth, async (req, res) => {
  const { title, description, image_url } = req.body;
  const userId = req.user.user.id;

  try {
    await pool.execute(
      'INSERT INTO community_doubts (user_id, title, description, image_url) VALUES (?, ?, ?, ?)',
      [userId, title, description, image_url || null]
    );
    res.json({ message: 'Doubt posted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get answers for a doubt
router.get('/doubt/:id/answers', auth, async (req, res) => {
  const doubtId = req.params.id;

  try {
    const [rows] = await pool.execute(
      'SELECT a.*, u.name as user_name FROM answers a JOIN users u ON a.user_id = u.id WHERE a.doubt_id = ? ORDER BY a.upvotes DESC, a.created_at DESC',
      [doubtId]
    );
    res.json({ answers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post answer
router.post('/doubt/:id/answer', auth, async (req, res) => {
  const doubtId = req.params.id;
  const { answer } = req.body;
  const userId = req.user.user.id;

  try {
    await pool.execute(
      'INSERT INTO answers (doubt_id, user_id, answer) VALUES (?, ?, ?)',
      [doubtId, userId, answer]
    );
    res.json({ message: 'Answer posted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upvote answer
router.post('/answer/:id/upvote', auth, async (req, res) => {
  const answerId = req.params.id;

  try {
    await pool.execute(
      'UPDATE answers SET upvotes = upvotes + 1 WHERE id = ?',
      [answerId]
    );
    res.json({ message: 'Upvoted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
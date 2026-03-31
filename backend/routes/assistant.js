const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');

const router = express.Router();

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Chat
router.post('/chat', auth, async (req, res) => {
  const { question } = req.body;
  const userId = req.user.user.id;

  try {
    let answer = 'MentorMind temporary response: API key not configured.';
    let confidence = 'Low';

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are MentorMind, a natural intelligent assistant. Respond naturally like a modern AI assistant. Use short replies for greetings, direct answers for arithmetic and facts, and detailed explanations only when needed.' },
          { role: 'user', content: question },
        ],
      });

      answer = completion.choices[0].message.content;
      confidence = 'High';
    }

    await pool.execute(
      'INSERT INTO chat_history (user_id, question, answer, confidence) VALUES (?, ?, ?, ?)',
      [userId, question, answer, confidence === 'High' ? 0.95 : 0.5]
    );

    res.json({ answer, confidence });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ message: 'AI service temporarily unavailable' });
  }
});

// Upload image
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  const { question } = req.body;
  const imagePath = req.file.path;
  const userId = req.user.user.id;

  try {
    let answer = 'MentorMind temporary response: API key not configured.';
    let confidence = 'Low';

    if (openai) {
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are MentorMind, a natural intelligent assistant. Respond naturally like a modern AI assistant. Use short replies for greetings, direct answers for arithmetic and facts, and detailed explanations only when needed.' },
          { role: 'user', content: [
            { type: 'text', text: question },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ] },
        ],
      });

      answer = completion.choices[0].message.content;
      confidence = 'High';
    }

    await pool.execute(
      'INSERT INTO chat_history (user_id, question, answer, confidence) VALUES (?, ?, ?, ?)',
      [userId, question, answer, confidence === 'High' ? 0.95 : 0.5]
    );

    res.json({ answer, confidence });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ message: 'AI service temporarily unavailable' });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  const userId = req.user.user.id;

  try {
    const [rows] = await pool.execute(
      'SELECT id, question, answer, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ message: 'Database connection error - cannot load history' });
  }
});

module.exports = router;
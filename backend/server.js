require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const assistantRoutes = require('./routes/assistant');
const communityRoutes = require('./routes/community');
const leaderboardRoutes = require('./routes/leaderboard');
const pool = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test DB connection
pool.getConnection()
  .then(() => console.log('MySQL connected'))
  .catch(err => {
    console.log('MySQL connection error:', err.message);
    console.log('Backend will run without database - some features may not work');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
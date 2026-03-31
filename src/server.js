const express = require('express');
const cors = require('cors');
const path = require('path');
const { logger } = require('./middleware/logger');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3579;

app.use(express.json());
app.use(cors());
app.use(logger);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

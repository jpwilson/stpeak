const express = require('express');
const cors = require('cors');
const path = require('path');
const { logger } = require('./middleware/logger');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// BUG 1: body-parser is in dependencies but we use express.json wrong
app.use(express.json);  // missing () - should be express.json()
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

// BUG 2: Error handler has wrong parameter order
app.use((req, res, err, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// BUG 3: app.listen callback has a typo in the template literal
app.listen(PORT, () => {
  console.log(`Server running on port ${PROT}`);
});

module.exports = app;

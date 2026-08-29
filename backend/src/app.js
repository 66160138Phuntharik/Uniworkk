const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const companyRoutes = require('./routes/companies');
const professorRoutes = require('./routes/professors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware 
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'UniWork API is running',
    timestamp: new Date().toISOString(),
  });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/professors', professorRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});


// start
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}/api/health`);
});

module.exports = app;

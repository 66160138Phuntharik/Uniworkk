const jwt = require('jsonwebtoken');

const { mockUsers } = require('../data/mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const login = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or incorrect role selected.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _pw, ...safeUser } = user;

  res.json({ token, user: safeUser });
};

const register = (req, res) => {
  res.status(201).json({
    message: 'Registration endpoint ready. Connect to Supabase to implement.',
  });
};

module.exports = { login, register };

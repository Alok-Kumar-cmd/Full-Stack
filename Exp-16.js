const express = require('express');
const app = express();
const PORT = 3000;

// Middleware 1: Logging Middleware
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

// Middleware 2: Bearer Token Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const secretToken = 'mysecrettoken';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === secretToken) {
      return next();
    }
  }

  res.status(401).json({ message: 'Authorization header missing or incorrect' });
};

// Apply logging middleware globally
app.use(loggingMiddleware);

// --- Routes ---
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
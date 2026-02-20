import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { db, initDb } from './database.js';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-kodbank-key';

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());

initDb();

// Register new user
app.post('/api/register', (req, res) => {
  const { uid, uname, password, email, phone, role } = req.body;

  if (!uid || !uname || !password || !email || !phone || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (role !== 'customer') {
    return res.status(400).json({ message: 'Role must be customer' });
  }

  const stmt = db.prepare(
    'INSERT INTO Koduser (uid, uname, password, email, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, 100000)',
  );
  stmt.run([uid, uname, password, email, phone, role], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'User ID or username already exists' });
      }
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(201).json({ message: 'Registration successful' });
  });
});

// Login and generate JWT
app.post('/api/login', (req, res) => {
  const { uname, password } = req.body;

  if (!uname || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM Koduser WHERE uname = ?', [uname], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row || row.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        sub: row.uname,
        role: row.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    // Save token in UserToken table
    const stmt = db.prepare('INSERT INTO UserToken (uname, token) VALUES (?, ?)');
    stmt.run([row.uname, token], (insertErr) => {
      if (insertErr) {
        console.error('Error saving token:', insertErr);
      }
    });

    // Set token as HTTP-only cookie
    res.cookie('kodbank_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.json({ message: 'Login successful' });
  });
});

// Middleware to verify JWT from cookie
function authenticateToken(req, res, next) {
  const token = req.cookies.kodbank_token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = payload;
    next();
  });
}

// Check balance
app.get('/api/balance', authenticateToken, (req, res) => {
  const uname = req.user.sub;

  db.get('SELECT balance FROM Koduser WHERE uname = ?', [uname], (err, row) => {
    if (err) {
      console.error('Error fetching balance:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ balance: row.balance });
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Kodbank backend running on http://localhost:${PORT}`);
});



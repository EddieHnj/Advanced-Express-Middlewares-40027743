require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // لازم برای Codespaces

const fs = require('fs');
const path = require('path');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());

// Response formatter
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    return originalJson.call(this, {
      success: true,
      data: data ?? null,
      timestamp: new Date().toISOString()
    });
  };
  next();
});

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// Auth middleware
const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    const err = new Error('Unauthorized: Invalid or missing API key');
    err.status = 401;
    return next(err);
  }
  next();
};

// Rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.'
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});
app.use('/users', auth, require('./routes/user'));

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: { message: err.message, status: err.status || 500 },
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

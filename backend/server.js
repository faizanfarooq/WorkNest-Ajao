require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/worknest_ajao';

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Connect to MongoDB & Start Server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[WorkNest Backend] Connected to MongoDB database successfully.');
    app.listen(PORT, () => {
      console.log(`[WorkNest Backend] REST API Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[WorkNest Backend] MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;

const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Enable Mongoose debug mode for development
mongoose.set('debug', process.env.NODE_ENV !== 'production');

// Connect to MongoDB with retry mechanism
const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Increase timeout settings
app.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutes timeout
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/tests', require('./routes/testRoutes2'));
app.use('/api/auth', require('./routes/authRoutes'));

// Error Handler
app.use(errorHandler);

const server = app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5001}`);
});

// Socket.IO setup with improved settings
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 120000,
  pingInterval: 10000,
  connectTimeout: 120000,
  maxHttpBufferSize: 1e8, // 100 MB
  transports: ['websocket', 'polling']
});

app.set('io', io);

// Enhanced Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Unhandled rejection handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import socket service
const socketService = require('./services/socketService');


// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const uploadRoutes = require('./routes/upload');
const connectionRoutes = require('./routes/connections');
const chatRoutes = require('./routes/chat');
const postRoutes = require('./routes/posts');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

// Import middleware
const { errorHandler, notFound, requestLogger } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Create Express app
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
    reportOnly: process.env.NODE_ENV !== 'production'
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_URL,
      'https://jobs-git-main-sunil2480s-projects.vercel.app',
      'https://jobs-ten-phi.vercel.app',
      'https://jobs-a9qjuvbsu-sunil2480s-projects.vercel.app',
      'https://job-1-5csh.onrender.com'
    ].filter(Boolean);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // Allow any *.vercel.app domain (for Vercel deployments)
    else if (origin && origin.match(/https:\/\/.*\.vercel\.app$/)) {
      callback(null, true);
    }
    // Allow any *.onrender.com domain (for Render deployments)
    else if (origin && origin.match(/https:\/\/.*\.onrender\.com$/)) {
      callback(null, true);
    }
    else {
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ]
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use(requestLogger);

// Serve static files (uploaded resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: require('./package.json').version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Job Portal API',
    docs: '/health for health check',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Initialize Socket.io
    socketService.initialize(server);
    
    // Make socket service globally available
    global.socketService = socketService;

    // Make server accessible for graceful shutdown
    global.server = server;
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
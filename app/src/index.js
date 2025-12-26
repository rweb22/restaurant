require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const itemRoutes = require('./routes/items');
const itemSizeRoutes = require('./routes/itemSizes');
const addOnRoutes = require('./routes/addOns');
const categoryAddOnRoutes = require('./routes/categoryAddOns');
const itemAddOnRoutes = require('./routes/itemAddOns');
const addressRoutes = require('./routes/addresses');
const offerRoutes = require('./routes/offers');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const notificationRoutes = require('./routes/notificationRoutes');
const pictureRoutes = require('./routes/pictures');
const uploadRoutes = require('./routes/upload');
const restaurantRoutes = require('./routes/restaurant');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS configuration - permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // In development, allow all localhost and 127.0.0.1 origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('exp://')) {
        return callback(null, true);
      }
    }

    // Check against allowed origins from env
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'restaurant-api'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/item-sizes', itemSizeRoutes);
app.use('/api/add-ons', addOnRoutes);
app.use('/api/category-add-ons', categoryAddOnRoutes);
app.use('/api/item-add-ons', itemAddOnRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pictures', pictureRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/restaurant', restaurantRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Restaurant Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      categories: '/api/categories',
      items: '/api/items',
      addons: '/api/addons',
      addresses: '/api/addresses',
      orders: '/api/orders'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Function to run database migrations
async function runMigrations() {
  try {
    logger.info('🔄 Running database migrations...');
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', {
      cwd: __dirname + '/..'
    });

    if (stdout) {
      logger.success('✅ Migrations completed successfully');
      // Log migration output (only show if there were actual migrations)
      if (!stdout.includes('No migrations were executed')) {
        logger.info(stdout.trim());
      }
    }

    if (stderr && !stderr.includes('Loaded configuration')) {
      logger.warn('Migration warnings:', stderr);
    }
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    if (error.stdout) logger.error('stdout:', error.stdout);
    if (error.stderr) logger.error('stderr:', error.stderr);
    throw error;
  }
}

// Start server only if not in test environment or not being required
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  // Run migrations before starting the server
  runMigrations()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        logger.success(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
        logger.info(`Auth API: http://localhost:${PORT}/api/auth`);
        logger.info(`Categories API: http://localhost:${PORT}/api/categories`);
        logger.info(`Items API: http://localhost:${PORT}/api/items`);
        logger.info(`Item Sizes API: http://localhost:${PORT}/api/item-sizes`);
        logger.info(`Add-Ons API: http://localhost:${PORT}/api/add-ons`);
        logger.info(`Category Add-Ons API: http://localhost:${PORT}/api/category-add-ons`);
        logger.info(`Item Add-Ons API: http://localhost:${PORT}/api/item-add-ons`);
        logger.info(`Addresses API: http://localhost:${PORT}/api/addresses`);
        logger.info(`Offers API: http://localhost:${PORT}/api/offers`);
        logger.info(`Orders API: http://localhost:${PORT}/api/orders`);
      });
    })
    .catch((error) => {
      logger.error('Failed to start server due to migration error');
      process.exit(1);
    });
}

module.exports = app;


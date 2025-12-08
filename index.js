require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const connectDB = require("./config/dbConfig");

// === ROUTES ===
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");


const app = express();

// === CONNECT DB ===
connectDB();

// === VIEW ENGINE ===
app.set("view engine", "ejs");
app.set("views", "./views");

// === SECURITY ===
app.use(helmet());

// === CORS ===
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// === LOGGING ===
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// === BODY PARSERS ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"));

// === SESSION ===
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: true, // Keep this true for production
    httpOnly: true,
    sameSite: 'none', // Changed from 'lax' to 'none' for cross-origin
    domain: '.onrender.com' // Optional: allows subdomain sharing
  },
  name: 'sessionId'
})
);

// === CONFIG ===
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// === JWT AUTH MIDDLEWARE ===
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authentication required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid or expired token'
    });
  }
}

function checkAdminForWrite(req, res, next) {
  if (req.method === 'GET') {
    next();
  } else {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required for this action'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.adminUser = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid authentication'
      });
    }
  }
}

// === BASIC ROUTES ===
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to MABS Electronics API",
    version: "1.0.0",
    documentation: "/api-docs"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// === ADMIN LOGIN (Database-based) ===
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Username and password required'
      });
    }

    // Use adminController to validate credentials
    const Admin = require("./models/adminModel");
    const admin = await Admin.findOne({ username }).select("+password");
    
    if (!admin) {
      console.warn(`❌ Failed login: ${username} - not found`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.warn(`❌ Failed login: ${username} - wrong password`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.isAdmin = true;
    req.session.adminUsername = username;

    console.log(`✅ Admin logged in: ${username}`);
    return res.json({ 
      status: 'success', 
      message: 'Login successful',
      user: username,
      token: token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Login error',
      error: err.message
    });
  }
});

// === ADMIN LOGOUT ===
app.get('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Logout failed' });
    }
    console.log('✅ Admin logged out');
    res.json({ status: 'success', message: 'Logged out' });
  });
});

// === TEMPORARY: Create First Admin ===
// REMOVE THIS ROUTE AFTER CREATING YOUR FIRST ADMIN
app.post('/create-first-admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Username and password required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Password must be at least 8 characters' 
      });
    }

    const Admin = require("./models/adminModel");
    const existing = await Admin.findOne({ username });
    
    if (existing) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Admin already exists' 
      });
    }

    const admin = await Admin.create({ username, password });
    
    console.log(`✅ Admin created: ${username}`);
    res.json({ 
      status: 'success',
      message: 'Admin created successfully', 
      admin: { id: admin._id, username: admin.username }
    });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Error creating admin',
      error: err.message 
    });
  }
});

// === API ROUTES ===
// Products - Allow GET, require auth for POST/PUT/DELETE
app.use("/api/products", checkAdminForWrite, productRoutes);

// Brands - Allow GET, require auth for POST/PUT/DELETE
app.use("/api/brands", checkAdminForWrite, brandRoutes);

// Categories - Allow GET, require auth for POST/PUT/DELETE
app.use("/api/categories", checkAdminForWrite, categoryRoutes);

// Contact - Allow POST (public)
app.use("/api/contact", contactRoutes);

// Cart - Allow all
app.use("/api/cart", cartRoutes);

// Admin - Protected routes
app.use("/api/admin", verifyAdminToken, adminRoutes);

//upload
app.use('/api/upload', uploadRoutes);

// === SWAGGER DOCS ===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Backend - Add proper error handling
app.get('/api/brands', async (req, res) => {
  try {
    console.log('📦 Fetching brands...');
    const Brand = require('./models/brandModel');
    const brands = await Brand.find();
    console.log(`✅ Found ${brands.length} brands`);
    res.json(brands);
  } catch (error) {
    console.error('❌ Get brands error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch brands',
      error: error.message 
    });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    console.log('📦 Fetching categories...');
    const Category = require('./models/categoryModel');
    const categories = await Category.find();
    console.log(`✅ Found ${categories.length} categories`);
    res.json(categories);
  } catch (error) {
    console.error('❌ Get categories error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products...');
    const Product = require('./models/productModel');
    const products = await Product.find();
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Get products error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
});

// Backend - /api/products
app.post('/api/products', async (req, res) => {
  try {
    console.log('📦 Backend: Creating product...');
    console.log('Request body:', req.body);
    
    const Product = require('./models/productModel');
    
    const productData = {
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      price: parseFloat(req.body.price),
      description: req.body.description,
      featured: req.body.featured === true || req.body.featured === 'true',
      images: Array.isArray(req.body.images) ? req.body.images : [req.body.images],
      specifications: req.body.specifications || {}
    };
    
    console.log('Creating product with data:', productData);
    
    const product = await Product.create(productData);
    
    console.log('✅ Product created:', product._id);
    
    res.status(201).json({
      status: 'success',
      data: product
    });
    
  } catch (error) {
    console.error('❌ Backend: Create product error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create product',
      error: error.message 
    });
  }
});

// === 404 HANDLER ===
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: "Route not found",
    path: req.originalUrl 
  });
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? "Server error" 
      : err.message
  });
});

// === GRACEFUL SHUTDOWN ===
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Global error handler - put this at the very end
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error',
    error: err.message 
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`📘 Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  //console.log(`🔐 Admin: ${ADMIN_USER} / ${ADMIN_PASSWORD}`);
});

module.exports = app;

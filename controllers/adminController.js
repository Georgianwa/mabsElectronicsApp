const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

// Create first admin manually (once)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ username, password });
    
    // Don't send password back
    res.status(201).json({ 
      message: "Admin created successfully", 
      admin: { id: admin._id, username: admin.username } 
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Error creating admin", error: err.message });
  }
};

// Login and generate token
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      admin: { id: admin._id, username: admin.username }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Middleware to protect routes
exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.adminId = decoded.id;
    req.admin = decoded;
    next();
  });
};

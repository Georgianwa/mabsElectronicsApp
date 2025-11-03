const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel"); // adjust path if different

dotenv.config(); // loads your .env file (for DB connection string)

const DB = process.env.MONGODB_URI;

mongoose.connect(DB)
.then(async () => {
  console.log("✅ Connected to MongoDB");

  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  // Check if admin already exists
  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log("⚠️ Admin already exists!");
    process.exit();
  }

  // Create a new admin
  const newAdmin = await Admin.create({ username, password });
  console.log("🎉 Admin created successfully:", newAdmin.username);

  mongoose.connection.close();
})
.catch(err => console.error("❌ MongoDB connection error:", err));

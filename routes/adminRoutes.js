// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Register (used once manually, then disable in production)
router.post("/register", adminController.registerAdmin);

// Login
router.post("/login", adminController.loginAdmin);

module.exports = router;

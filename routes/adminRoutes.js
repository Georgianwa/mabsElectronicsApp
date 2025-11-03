const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Register (disable in production or protect with secret key)
router.post("/register", adminController.registerAdmin);

// Login (consider adding rate limiting)
router.post("/login", adminController.loginAdmin);



// Protected routes (add more admin functionality here)
router.get("/profile", adminController.verifyAdmin, (req, res) => {
  res.json({ 
    message: "Admin profile", 
    adminId: req.adminId 
  });
});

module.exports = router;

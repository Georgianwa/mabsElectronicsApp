const express = require("express");
const productController = require("../controllers/productController");
const Auth = require("../middlewares/authMiddleware");
const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes

// Public routes - specific paths first
router.get("/", productController.getAllProducts);
router.get("/category/:categoryName", productController.getProductByCategory);
router.get("/brand/:brandName", productController.getProductByBrand);

// Then parameterized routes
router.get("/:id", productController.getProductById);

// Protected routes
router.post("/", Auth, productController.createProduct);
router.put("/:id", Auth, productController.updateProduct);
router.delete("/:id", Auth, productController.deleteProduct);

module.exports = router;

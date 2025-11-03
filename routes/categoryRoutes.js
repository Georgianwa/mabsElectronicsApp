const express = require("express");
const categoryController = require("../controllers/categoryController"); // FIXED!
const Auth = require("../middlewares/authMiddleware");
const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected routes
router.post("/", Auth, categoryController.createCategory);
router.put("/:id", Auth, categoryController.updateCategory);
router.delete("/:id", Auth, categoryController.deleteCategory);

module.exports = router;

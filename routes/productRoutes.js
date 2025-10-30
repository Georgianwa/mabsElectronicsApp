const express = require("express");
const productController = require("../controllers/productController");
const Auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", Auth, productController.createProduct);

router.get("/", productController.getAllProducts);  
router.get("/:id", productController.getProductById);
router.get("/category/:categoryId", productController.getProductByCategory);
router.get("/brand/:brandId", productController.getProductByBrand);

router.put("/:id", Auth, productController.updateProduct);   

router.delete("/:id", Auth, productController.deleteProduct);


module.exports = router;

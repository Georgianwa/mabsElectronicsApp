const express = require("express");
const brandController = require("../controllers/brandController");
const Auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", Auth, brandController.createBrand);
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.put("/:id", Auth, brandController.updateBrand);
router.delete("/:id", Auth, brandController.deleteBrand);


module.exports = router;

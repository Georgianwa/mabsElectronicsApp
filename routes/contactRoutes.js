const express = require("express");
const contactController = require("../controllers/brandController");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("contactUs.ejs", { title: "Contact Us" });
});

module.exports = router;
// index.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const connectDB = require("./config/dbConfig");

// === ROUTES ===
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const aboutRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// === CONNECT DB ===
connectDB();

// === VIEW ENGINE ===
app.set("view engine", "ejs");
app.set("views", "./views");

// === MIDDLEWARES ===
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// === SESSION CONFIG ===
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false, // set true in production (HTTPS)
    },
  })
);

// === ROUTES ===
app.use("/products", productRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/aboutUs", aboutRoutes);
app.use("/contactUs", contactRoutes);
app.use("/api/admin", adminRoutes);


// session-based cart
app.use("/api/cart", cartRoutes);

// === BASIC ROUTES ===
app.get("/", (req, res) => {
  res.send("Welcome to MABS Electronics API");
});

app.get("/test", (req, res) => {
  res.send("Testing the routes");
});

// === SWAGGER DOCS ===
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === 404 HANDLER ===
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error", details: err.message });
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs at http://localhost:${PORT}/api-docs`);
});

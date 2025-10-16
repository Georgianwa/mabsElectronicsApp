const express = require("express");
//const connectDB = require("./config/dbConfig")
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
//const testEmailRoute = require("./routes/testEmailRoute");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
//connectDB();


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/products", productRoutes,  (req, res) => {
    res.send("Product route testing");
});

app.use("/brands", brandRoutes);

app.use("/brands", brandRoutes);

//app.get("/products", (req, res) => {
//    res.send("Product route testing");
//});

app.get("/", (req, res) => {
    //res.send("Welcome to MABS Electronics API");
    res.render("index.ejs", {title: "Home Page"});
});


app.get("/test", (req, res) => {
    res.send("Testing the routes");
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`We are live at http:localhost:${PORT}`);
    console.log(`Swagger Docs at http://localhost:${PORT}/api-docs`);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

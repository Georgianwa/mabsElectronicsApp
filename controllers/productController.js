const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, brand, price } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !price) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    // ✅ Validate category and brand existence
    const foundCategory = category ? await Category.findById(category) : null;
    const foundBrand = brand ? await Brand.findById(brand) : null;

    if (category && !foundCategory) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    if (brand && !foundBrand) {
      return res.status(400).json({ message: "Invalid brand ID" });
    }

    // ✅ Create product
    const newProduct = new Product({ title, description, category, brand, price });
    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to create product",
      details: error.message,
    });
  }
};

/**
 * Get all products (with filtering, pagination, and sorting)
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "-createdAt",
      fields,
    } = req.query;

    const filter = {};

    // 🔍 Search by title, brand, or category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter by category and brand
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    // 💰 Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🧮 Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 🧾 Field selection and sorting
    const selectFields = fields ? fields.split(",").join(" ") : "";
    const sortBy = sort || "-createdAt";

    // 🔎 Query
    const products = await Product.find(filter)
      .sort(sortBy)
      .select(selectFields)
      .skip(skip)
      .limit(limitNum)
      .populate("brand", "name")
      .populate("category", "title");

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve products",
      details: error.message,
    });
  }
};

/**
 * Get products by category name
 */
exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const category = await Category.findOne({ title: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ category: category._id })
      .populate("brand", "name")
      .populate("category", "title");

    res.status(200).json({
      total: products.length,
      category: categoryName,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve products by category",
      details: error.message,
    });
  }
};

/**
 * Get products by brand name
 */
exports.getProductByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;

    const brand = await Brand.findOne({ name: brandName });
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const products = await Product.find({ brand: brand._id })
      .populate("brand", "name")
      .populate("category", "title");

    res.status(200).json({
      total: products.length,
      brand: brandName,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve products by brand",
      details: error.message,
    });
  }
};

/**
 * Get a single product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("brand", "name")
      .populate("category", "title");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve product by ID",
      details: error.message,
    });
  }
};

/**
 * Update a product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, category, brand, price } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update only provided fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (price) product.price = price;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update product",
      details: error.message,
    });
  }
};

/**
 * Delete a product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete product",
      details: error.message,
    });
  }
};


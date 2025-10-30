// controllers/productController.js
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      title,
      description,
      category, // id
      brand, // id
      price,
      productSpecifications,
    } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || !category || !brand) {
      return res.status(400).json({ message: "Please fill in all required fields: title, description, price, category, brand" });
    }

    // Confirm category & brand exist
    const foundCategory = await Category.findById(category);
    if (!foundCategory) return res.status(400).json({ message: "Invalid category ID" });

    const foundBrand = await Brand.findById(brand);
    if (!foundBrand) return res.status(400).json({ message: "Invalid brand ID" });

    // Create product
    const newProduct = new Product({
      productId,
      title,
      description,
      category,
      brand,
      price,
      productSpecifications,
    });

    await newProduct.save();

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    // handle duplicate key error for unique fields
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate value", details: error.keyValue });
    }
    res.status(500).json({ message: "Unable to create product", details: error.message });
  }
};

/**
 * Get all products with filtering, pagination, sorting
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

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const selectFields = fields ? fields.split(",").join(" ") : "";
    const sortBy = sort;

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
    res.status(500).json({ message: "Unable to retrieve products", details: error.message });
  }
};

/**
 * Get products by category title (human-friendly)
 */
exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const category = await Category.findOne({ title: categoryName });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const products = await Product.find({ category: category._id })
      .populate("brand", "name")
      .populate("category", "title");

    res.status(200).json({ total: products.length, category: categoryName, products });
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve products by category", details: error.message });
  }
};

/**
 * Get products by brand name (human-friendly)
 */
exports.getProductByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const brand = await Brand.findOne({ name: brandName });
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    const products = await Product.find({ brand: brand._id })
      .populate("brand", "name")
      .populate("category", "title");

    res.status(200).json({ total: products.length, brand: brandName, products });
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve products by brand", details: error.message });
  }
};

/**
 * Get a single product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("brand", "name").populate("category", "title");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve product by ID", details: error.message });
  }
};

/**
 * Update a product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, category, brand, price, productSpecifications } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (price !== undefined) product.price = price;
    if (productSpecifications) product.productSpecifications = productSpecifications;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Unable to update product", details: error.message });
  }
};

/**
 * Delete a product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete product", details: error.message });
  }
};

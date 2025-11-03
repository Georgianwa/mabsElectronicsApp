const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const mongoose = require("mongoose");

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      category,
      brand,
      price,
      productSpecifications,
    } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || !category || !brand) {
      return res.status(400).json({ 
        message: "Please fill in all required fields: title, description, price, category, brand" 
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(brand)) {
      return res.status(400).json({ message: "Invalid brand ID format" });
    }

    // Confirm category & brand exist
    const [foundCategory, foundBrand] = await Promise.all([
      Category.findById(category),
      Brand.findById(brand)
    ]);

    if (!foundCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    if (!foundBrand) {
      return res.status(400).json({ message: "Brand not found" });
    }

    // Create product
    const newProduct = await Product.create({
      productId,
      title: title.trim(),
      description: description.trim(),
      category,
      brand,
      price: Number(price),
      productSpecifications,
    });

    // Populate for response
    await newProduct.populate([
      { path: 'category', select: 'title' },
      { path: 'brand', select: 'name' }
    ]);

    res.status(201).json({ 
      message: "Product created successfully", 
      product: newProduct 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate value", 
        details: error.keyValue 
      });
    }
    console.error("Create product error:", error);
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

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }
    
    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      filter.brand = brand;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const selectFields = fields ? fields.split(",").join(" ") : "";

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .select(selectFields)
        .skip(skip)
        .limit(limitNum)
        .populate("brand", "name")
        .populate("category", "title")
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Unable to retrieve products", details: error.message });
  }
};

/**
 * Get products by category title
 */
exports.getProductByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const category = await Category.findOne({ 
      title: { $regex: `^${categoryName}$`, $options: 'i' } 
    }).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ category: category._id })
      .populate("brand", "name")
      .populate("category", "title")
      .lean();

    res.status(200).json({ 
      total: products.length, 
      category: category.title, 
      products 
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ message: "Unable to retrieve products by category", details: error.message });
  }
};

/**
 * Get products by brand name
 */
exports.getProductByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    
    const brand = await Brand.findOne({ 
      name: { $regex: `^${brandName}$`, $options: 'i' } 
    }).lean();

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const products = await Product.find({ brand: brand._id })
      .populate("brand", "name")
      .populate("category", "title")
      .lean();

    res.status(200).json({ 
      total: products.length, 
      brand: brand.name, 
      products 
    });
  } catch (error) {
    console.error("Get products by brand error:", error);
    res.status(500).json({ message: "Unable to retrieve products by brand", details: error.message });
  }
};

/**
 * Get a single product by ID
 * FIXED: Changed param name to 'id' to match route
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id)
      .populate("brand", "name")
      .populate("category", "title")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Unable to retrieve product", details: error.message });
  }
};

/**
 * Update a product
 * FIXED: Changed param name to 'id'
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, brand, price, productSpecifications } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate references if changing
    if (category && category !== product.category.toString()) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(400).json({ message: "Category not found" });
      }
      product.category = category;
    }

    if (brand && brand !== product.brand.toString()) {
      if (!mongoose.Types.ObjectId.isValid(brand)) {
        return res.status(400).json({ message: "Invalid brand ID format" });
      }
      const foundBrand = await Brand.findById(brand);
      if (!foundBrand) {
        return res.status(400).json({ message: "Brand not found" });
      }
      product.brand = brand;
    }

    if (title) product.title = title.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ message: "Price cannot be negative" });
      }
      product.price = Number(price);
    }
    if (productSpecifications) product.productSpecifications = productSpecifications;

    await product.save();
    await product.populate([
      { path: 'category', select: 'title' },
      { path: 'brand', select: 'name' }
    ]);

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Unable to update product", details: error.message });
  }
};

/**
 * Delete a product
 * FIXED: Changed param name to 'id'
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Unable to delete product", details: error.message });
  }
};

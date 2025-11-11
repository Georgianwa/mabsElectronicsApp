// controllers/categoryController.js
const Category = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { title, categoryId, description, image } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Category title is required" });
    }

    const existingCategory = await Category.findOne({ title });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists!" });
    }

    const categoryData = {
      title: title.trim(),
      description: description?.trim() || "",
    };

    // Add optional fields if provided
    if (categoryId) categoryData.categoryId = categoryId;
    
    // Handle image field properly
    if (image) {
      // Support both string URL and object format
      if (typeof image === 'string') {
        categoryData.image = { url: image };
      } else if (image.url) {
        categoryData.image = { url: image.url };
      }
    }

    const category = await Category.create(categoryData);
    
    res.status(201).json({ 
      message: "Category created successfully", 
      category 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate category", 
        details: error.keyValue 
      });
    }
    console.error("Create category error:", error);
    res.status(500).json({ 
      message: "Unable to create category", 
      error: error.message 
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const filter = search ? { 
      title: { $regex: search, $options: 'i' } 
    } : {};

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const categories = await Category.find(filter)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Category.countDocuments(filter);

    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ 
      message: "Could not find categories", 
      error: error.message 
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({ 
      message: "Category does not exist", 
      error: error.message 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    
    // Handle image updates
    if (image) {
      if (typeof image === 'string') {
        updateData.image = { url: image };
      } else if (image.url) {
        updateData.image = { url: image.url };
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ 
      message: "Category updated successfully", 
      category 
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ 
      message: "Unable to update category", 
      error: error.message 
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ 
      message: `Category '${category.title}' deleted successfully` 
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ 
      message: "Unable to delete category", 
      error: error.message 
    });
  }
};
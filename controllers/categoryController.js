// controllers/categoryController.js
const Category = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { title, categoryId, description } = req.body;
    if (!title) return res.status(400).json({ message: "Category title is required" });

    const existingCategory = await Category.findOne({ title });
    if (existingCategory) return res.status(400).json({ message: "Category already exists!" });

    const category = new Category({ title, categoryId, description });
    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate category", details: error.keyValue });
    }
    res.status(500).json({ message: "Unable to create category", error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Could not find categories", error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Category does not exist", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Unable to update category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: `Category '${category.title}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete category", error: error.message });
  }
};

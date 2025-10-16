const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModel");
const dotenv = require("dotenv");

dotenv.config();

exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;

        if (!name) {
        return res.status(400).json({ message: "Brand name is required" });
        }
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }
    const brand = new Brand({ name });
    await brand.save();
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Unable to create brand", error: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Unable to find brands", error: error.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
    } catch (error) {   
    res.status(500).json({ message: "Brand does not exist", error: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body;  
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name },
        { new: true }
    );
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: "Brand updated successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Unable to update brand", error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
    res.status(500).json({ message: "Unable to delete brand", error: error.message });
  }
};

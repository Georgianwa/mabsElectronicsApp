const Brand = require("../models/brandModel");

exports.createBrand = async (req, res) => {
  try {
    const { name, brandId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const existingBrand = await Brand.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    
    if (existingBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const brand = await Brand.create({ name: name.trim(), brandId });

    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate brand", 
        details: error.keyValue 
      });
    }
    console.error("Create brand error:", error);
    res.status(500).json({ message: "Unable to create brand", error: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const filter = search ? { 
      name: { $regex: search, $options: 'i' } 
    } : {};

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const brands = await Brand.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Brand.countDocuments(filter);

    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      brands
    });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ message: "Unable to find brands", error: error.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).lean();
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
  } catch (error) {
    console.error("Get brand by ID error:", error);
    res.status(500).json({ message: "Brand does not exist", error: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id, 
      { name: name.trim() }, 
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand updated successfully", brand });
  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({ message: "Unable to update brand", error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: `Brand '${brand.name}' deleted successfully` });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ message: "Unable to delete brand", error: error.message });
  }
};

// models/categoryModel.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  // optional categoryId
  categoryId: {
    type: String,
    unique: true,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
});

module.exports = mongoose.model("Category", categorySchema);

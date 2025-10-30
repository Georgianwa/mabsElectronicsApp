// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // optional external product identifier (if you want it)
  productId: {
    type: String,
    unique: true,
    sparse: true, // allow missing productId for legacy docs
  },

  // simplified/consistent field names
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  // productSpecifications: object/map of key->value strings
  productSpecifications: {
    type: Map,
    of: String,
    default: {},
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);

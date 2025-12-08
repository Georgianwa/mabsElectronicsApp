const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, 'Category is required'],
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: [true, 'Brand is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    get: v => Math.round(v * 100) / 100 // Round to 2 decimals
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'Stock cannot be negative']
  },
  images: [{
    type: String,
    trim: true
  }],
  productSpecifications: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeautured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for common queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for stock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

module.exports = mongoose.model("Product", productSchema);

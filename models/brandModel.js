const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  brandId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
brandSchema.index({ name: 1 });

module.exports = mongoose.model("Brand", brandSchema);

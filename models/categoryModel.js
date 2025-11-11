const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Category title is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: "",
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: { type: String, default: "" },
    //publicId: { type: String, default: "" }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
categorySchema.index({ title: 1 });

module.exports = mongoose.model("Category", categorySchema);

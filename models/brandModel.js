// models/brandModel.js
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  brandId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
});

module.exports = mongoose.model("Brand", brandSchema);

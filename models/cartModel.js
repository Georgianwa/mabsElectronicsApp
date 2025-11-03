const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1, 
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer'
    }
  },
  priceAtAdd: { 
    type: Number, 
    required: true, 
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  items: {
    type: [cartItemSchema],
    default: [],
    validate: {
      validator: function(items) {
        return items.length <= 100; // Max 100 items
      },
      message: 'Cart cannot contain more than 100 items'
    }
  },
  totalPrice: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  status: {
    type: String,
    enum: ["active", "ordered", "cancelled"],
    default: "active",
    index: true
  }
}, {
  timestamps: true
});

// Calculate total before saving
cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + (item.priceAtAdd * item.quantity), 
    0
  );
  next();
});

// Compound index for finding active carts
cartSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Cart", cartSchema);

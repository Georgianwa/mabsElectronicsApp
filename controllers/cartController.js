const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel");
const transporter = require("../config/emailConfig");

/**
 * Helper: Calculate total
 */
function calculateTotal(items) {
  return items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
}

/**
 * Helper: Validate cart item
 */
function validateCartItem(productId, name, price, quantity) {
  const errors = [];
  
  if (!productId) errors.push("Product ID is required");
  if (!name || name.trim() === "") errors.push("Product name is required");
  if (price === undefined || price < 0) errors.push("Valid price is required");
  if (quantity !== undefined && (quantity < 1 || !Number.isInteger(Number(quantity)))) {
    errors.push("Quantity must be a positive integer");
  }
  
  return errors;
}

/**
 * Get Cart (from session)
 */
exports.getCart = (req, res) => {
  const cart = req.session.cart || [];
  const total = calculateTotal(cart);
  
  res.status(200).json({
    items: cart,
    total: total.toFixed(2),
    itemCount: cart.reduce((sum, it) => sum + it.quantity, 0)
  });
};

/**
 * Add Item to Cart (Session-Based)
 * Body: { productId, name, price, quantity }
 */
exports.addItemToCart = (req, res) => {
  const { productId, name, price, quantity = 1 } = req.body;

  const errors = validateCartItem(productId, name, price, quantity);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(it => it.productId === productId);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    req.session.cart.push({
      productId,
      name: name.trim(),
      price: Number(price),
      quantity: Number(quantity),
    });
  }

  const total = calculateTotal(req.session.cart);

  res.status(200).json({
    message: "Item added to cart",
    cart: req.session.cart,
    total: total.toFixed(2)
  });
};

/**
 * Update Item Quantity
 * Body: { productId, quantity }
 */
exports.updateItemQuantity = (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: "Valid quantity is required" });
  }

  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const item = req.session.cart.find(it => it.productId === productId);
  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  if (Number(quantity) <= 0) {
    req.session.cart = req.session.cart.filter(it => it.productId !== productId);
  } else {
    item.quantity = Number(quantity);
  }

  const total = calculateTotal(req.session.cart);

  res.status(200).json({
    message: "Cart updated",
    cart: req.session.cart,
    total: total.toFixed(2)
  });
};

/**
 * Remove Item
 * Body: { productId }
 */
exports.removeItem = (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const initialLength = req.session.cart.length;
  req.session.cart = req.session.cart.filter(it => it.productId !== productId);

  if (req.session.cart.length === initialLength) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  const total = calculateTotal(req.session.cart);

  res.status(200).json({
    message: "Item removed",
    cart: req.session.cart,
    total: total.toFixed(2)
  });
};

/**
 * Clear Cart
 */
exports.clearCart = (req, res) => {
  req.session.cart = [];
  res.status(200).json({ message: "Cart cleared", cart: [] });
};

/**
 * Checkout via WhatsApp
 * Query: ?phone=+123456789
 */
exports.checkoutWhatsApp = (req, res) => {
  const phone = req.query.phone;
  const cart = req.session.cart || [];

  if (!phone || phone.trim() === "") {
    return res.status(400).json({ message: "WhatsApp phone number is required" });
  }

  if (cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = calculateTotal(cart);
  const itemList = cart.map(
    it => `• ${it.name} (x${it.quantity}) - $${(it.price * it.quantity).toFixed(2)}`
  ).join("\n");

  const message = `Hello! I would like to purchase the following items:\n\n${itemList}\n\n*Total: $${total.toFixed(2)}*\n\nPlease confirm availability.`;
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = phone.replace(/[^\d+]/g, '');

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  res.status(200).json({ 
    whatsappUrl,
    message: "WhatsApp checkout URL generated"
  });
};

/**
 * Checkout via Email
 * Body: { toEmail }
 */
exports.checkoutEmail = async (req, res) => {
  const { toEmail } = req.body;
  const cart = req.session.cart || [];

  if (!toEmail || !toEmail.includes('@')) {
    return res.status(400).json({ message: "Valid recipient email is required" });
  }

  if (cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = calculateTotal(cart);
  const itemList = cart.map(
    it => `${it.name} (x${it.quantity}) - $${(it.price * it.quantity).toFixed(2)}`
  ).join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Purchase Inquiry - Cart Items",
    text: `Hello! I would like to purchase the following items:\n\n${itemList}\n\nTotal: $${total.toFixed(2)}\n\nPlease confirm availability and payment details.`,
    html: `
      <h2>Purchase Inquiry</h2>
      <p>Hello! I would like to purchase the following items:</p>
      <ul>
        ${cart.map(it => `<li>${it.name} (x${it.quantity}) - $${(it.price * it.quantity).toFixed(2)}</li>`).join('')}
      </ul>
      <h3>Total: $${total.toFixed(2)}</h3>
      <p>Please confirm availability and payment details.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Checkout email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: "Error sending email", details: error.message });
  }
};

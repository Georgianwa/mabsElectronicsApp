// controllers/cartController.js
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const transporter = require("../config/emailConfig");

/**
 * Helper: Calculate total
 */
function calculateTotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

/**
 * Get Cart (from session)
 */
exports.getCart = (req, res) => {
  res.status(200).json(req.session.cart || []);
};

/**
 * Add Item to Cart (Session-Based)
 * Body: { productId, name, price, quantity }
 */
exports.addItemToCart = (req, res) => {
  const { productId, name, price, quantity = 1 } = req.body;

  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(
    (it) => it.productId === productId
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    req.session.cart.push({
      productId,
      name,
      price,
      quantity: Number(quantity),
    });
  }

  res.status(200).json({
    message: "Item added to cart",
    cart: req.session.cart,
  });
};

/**
 * Update Item Quantity
 * Body: { productId, quantity }
 */
exports.updateItemQuantity = (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) return res.status(400).json({ message: "Cart is empty" });

  const item = req.session.cart.find((it) => it.productId === productId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (Number(quantity) <= 0) {
    req.session.cart = req.session.cart.filter((it) => it.productId !== productId);
  } else {
    item.quantity = Number(quantity);
  }

  res.status(200).json({
    message: "Cart updated",
    cart: req.session.cart,
  });
};

/**
 * Remove Item
 * Body: { productId }
 */
exports.removeItem = (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) return res.status(400).json({ message: "Cart is empty" });

  req.session.cart = req.session.cart.filter((it) => it.productId !== productId);
  res.status(200).json({
    message: "Item removed",
    cart: req.session.cart,
  });
};

/**
 * Clear Cart
 */
exports.clearCart = (req, res) => {
  req.session.cart = [];
  res.status(200).json({ message: "Cart cleared" });
};

/**
 * Checkout via WhatsApp
 * Query: ?phone=+123456789
 */
exports.checkoutWhatsApp = (req, res) => {
  const phone = req.query.phone;
  const cart = req.session.cart || [];

  if (!phone) return res.status(400).json({ message: "WhatsApp phone number is required" });
  if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const total = calculateTotal(cart);
  const itemList = cart.map(
    (it) => `• ${it.name} (x${it.quantity}) - $${(it.price * it.quantity).toFixed(2)}`
  ).join("\n");

  const message = `Hello there! I want to purchase the following item(s) and would like to confirm availability before payment:\n\n${itemList}\n\n*Total:* $${total.toFixed(2)}`;
  const encodedMessage = encodeURIComponent(message);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
  res.status(200).json({ whatsappUrl });
};

/**
 * Checkout via Email
 * Body: { toEmail }
 */
exports.checkoutEmail = async (req, res) => {
  const { toEmail } = req.body;
  const cart = req.session.cart || [];

  if (!toEmail) return res.status(400).json({ message: "Recipient email is required" });
  if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const total = calculateTotal(cart);
  const itemList = cart.map(
    (it) => `${it.name} (x${it.quantity}) - $${(it.price * it.quantity).toFixed(2)}`
  ).join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Purchase Inquiry - Cart Items",
    text: `Hello there! I want to purchase the following item(s) and would like to confirm availability before payment:\n\n${itemList}\n\nTotal: $${total.toFixed(2)}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Checkout email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", details: error.message });
  }
};

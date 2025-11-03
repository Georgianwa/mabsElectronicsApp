require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { products, categories, brands } = require('./data/products');

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Convert data to use _id instead of id for MongoDB compatibility
const convertedProducts = products.map(p => ({ ...p, _id: p.id }));
const convertedCategories = categories.map(c => ({ ...c, _id: c.id }));
const convertedBrands = brands.map(b => ({ ...b, _id: b.id }));

// API Routes
app.get('/api/products', (req, res) => {
  res.json(convertedProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = convertedProducts.find(p => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/api/products/category/:categoryId', (req, res) => {
  const categoryProducts = convertedProducts.filter(p => p.category === req.params.categoryId);
  res.json(categoryProducts);
});

app.get('/api/products/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = convertedProducts.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  res.json(results);
});

app.get('/api/categories', (req, res) => {
  res.json(convertedCategories);
});

app.get('/api/categories/:id', (req, res) => {
  const category = convertedCategories.find(c => c._id === req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

app.get('/api/brands', (req, res) => {
  res.json(convertedBrands);
});

app.get('/api/brands/:id', (req, res) => {
  const brand = convertedBrands.find(b => b._id === req.params.id);
  if (brand) {
    res.json(brand);
  } else {
    res.status(404).json({ message: 'Brand not found' });
  }
});

// POST/PUT/DELETE for admin
app.post('/api/products', (req, res) => {
  const newProduct = { ...req.body, _id: 'prod-' + Date.now() };
  convertedProducts.push(newProduct);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const index = convertedProducts.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    convertedProducts[index] = { ...convertedProducts[index], ...req.body };
    res.json(convertedProducts[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const index = convertedProducts.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    convertedProducts.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
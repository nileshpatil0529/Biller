const express = require('express');
const router = express.Router();
const pool = require('../db');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/sync');
const upload = multer({ dest: 'uploads/' });

// Upload and import products from file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.csv') {
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: 'Only CSV files are supported.' });
  }
  let errors = [];
  try {
    const csv = fs.readFileSync(filePath, { encoding: 'utf8' });
    fs.unlinkSync(filePath);
    let headerLine = csv.split('\n')[0].replace(/\r/g, '');
    if (headerLine.charCodeAt(0) === 0xFEFF) headerLine = headerLine.slice(1);
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['code', 'name', 'unit', 'price', 'stockqty'];
    const missingHeaders = requiredHeaders.filter(f => !headers.includes(f));
    if (missingHeaders.length > 0) {
      return res.status(400).json({ message: 'CSV format error', errors: [{ row: 0, error: 'CSV format error: missing columns', missingColumns: missingHeaders }] });
    }
    let products = csvParse.parse(csv, { columns: true, skip_empty_lines: true }).map(prod => {
      const normalized = {};
      Object.keys(prod).forEach(key => {
        let cleanKey = key.charCodeAt(0) === 0xFEFF ? key.slice(1) : key;
        cleanKey = cleanKey.trim().toLowerCase();
        normalized[cleanKey] = typeof prod[key] === 'string' ? prod[key].trim() : prod[key];
      });
      return normalized;
    });
    products.forEach(prod => {
      if (!prod.code || prod.code.trim() === '') prod.code = String(Date.now()) + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    });
    const allExisting = await Product.findAll({ attributes: ['code', 'name'] });
    const existingCodes = new Set(allExisting.map(p => String(p.code)));
    const existingNames = new Set(allExisting.map(p => String(p.name).toLowerCase()));
    const batchCodes = new Set(), batchNames = new Set();
    products.forEach((prod, idx) => {
      const codeStr = String(prod.code), nameLower = String(prod.name).toLowerCase();
      let rowErrors = [];
      ['name', 'unit', 'price', 'stockqty'].forEach(f => { if (!prod[f] || prod[f] === '') rowErrors.push(`Missing field '${f}'`); });
      if (existingCodes.has(codeStr)) rowErrors.push(`Duplicate code: '${prod.code}' already exists.`);
      if (batchCodes.has(codeStr)) rowErrors.push(`Duplicate code in file: '${prod.code}' appears multiple times.`);
      if (existingNames.has(nameLower)) rowErrors.push(`Duplicate name: '${prod.name}' already exists.`);
      if (batchNames.has(nameLower)) rowErrors.push(`Duplicate name in file: '${prod.name}' appears multiple times.`);
      if (rowErrors.length) errors.push({ row: idx + 2, error: rowErrors.join('; ') });
      batchCodes.add(codeStr); batchNames.add(nameLower);
    });
    if (errors.length) return res.status(400).json({ message: 'Validation errors', errors });
    const created = products.length ? await Product.bulkCreate(products) : [];
    res.json({ message: 'Products imported successfully', added: created.length });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error', error: err.message, details: err });
  }
});
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of productsnode
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQty:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added
 *       401:
 *         description: Unauthorized
 */

// ...existing code...
// Edit product (protected)
router.put('/:id', auth, async (req, res) => {
  const { code, name, unit, price, stockQty } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update({ code, name, unit, price, stockQty });
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (protected)
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product (protected)
router.post('/', auth, async (req, res) => {
  let products = req.body;
  if (!Array.isArray(products)) {
    products = [products];
  }
  // Validate each product before bulkCreate
  const requiredFields = ['code', 'name', 'price'];
  const errors = [];
  const validProducts = [];
  products.forEach((prod, idx) => {
    const missing = requiredFields.filter(f => !prod[f] && prod[f] !== 0);
    if (missing.length > 0) {
      errors.push({ index: idx, product: prod, error: `Missing fields: ${missing.join(', ')}` });
    } else {
      validProducts.push(prod);
    }
  });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }
  try {
    const created = await Product.bulkCreate(validProducts);
    res.json({ message: 'Products added', products: created });
  } catch (err) {
    // Sequelize validation errors (e.g. duplicate code)
    if (err.name === 'SequelizeUniqueConstraintError' && err.errors) {
      return res.status(400).json({
        message: 'Unique constraint error',
        errors: err.errors.map(e => ({ field: e.path, value: e.value, message: e.message }))
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete product (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

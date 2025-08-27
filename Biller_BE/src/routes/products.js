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
 *               nameHindi:
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

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all products (protected)
router.get('/', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const products = await conn.query('SELECT * FROM products');
    conn.release();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product (protected)
router.post('/', auth, async (req, res) => {
  const { code, name, nameHindi, unit, price, stockQty } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO products (code, name, nameHindi, unit, price, stockQty) VALUES (?, ?, ?, ?, ?, ?)', [code, name, nameHindi, unit, price, stockQty]);
    conn.release();
    res.json({ message: 'Product added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

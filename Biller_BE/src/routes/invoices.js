/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client:
 *                 type: string
 *               location:
 *                 type: string
 *               discount:
 *                 type: number
 *               total:
 *                 type: number
 *               grandTotal:
 *                 type: number
 *               paymentStatus:
 *                 type: string
 *               paymentMode:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Invoice added
 *       401:
 *         description: Unauthorized
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all invoices (protected)
router.get('/', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const invoices = await conn.query('SELECT * FROM invoices');
    conn.release();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add invoice (protected)
router.post('/', auth, async (req, res) => {
  const { client, location, discount, total, grandTotal, paymentStatus, paymentMode, products } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO invoices (client, location, discount, total, grandTotal, paymentStatus, paymentMode, products) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [client, location, discount, total, grandTotal, paymentStatus, paymentMode, JSON.stringify(products)]);
    conn.release();
    res.json({ message: 'Invoice added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

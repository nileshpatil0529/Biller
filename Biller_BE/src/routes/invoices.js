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
const Invoice = require('../models/Invoice');
const InvoiceProduct = require('../models/InvoiceProduct');
const auth = require('../middleware/auth');

// Get all invoices (protected)
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add invoice (protected)
router.post('/', auth, async (req, res) => {
  const { client, location, discount, total, grandTotal, paymentStatus, paymentMode, products } = req.body;
  try {
    // Create invoice
    const invoice = await Invoice.create({
      client,
      location,
      discount,
      total,
      grandTotal,
      paymentStatus,
      paymentMode
    });

    // Add products to invoice_products table
    if (Array.isArray(products)) {
      for (const prod of products) {
        await InvoiceProduct.create({
          invoice_id: invoice.id,
          product_id: prod.code, // You may need to map code to product_id
          sell_qty: prod.sell_qty,
          price: prod.price,
          totalValue: prod.totalValue
        });
      }
    }

    res.json({ message: 'Invoice added', invoiceId: invoice.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

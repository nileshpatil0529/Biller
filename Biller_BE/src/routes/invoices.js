const express = require('express');
const router = express.Router();
// Update invoice (protected)

/**
 * @swagger
 * /api/invoices/{id}/products:
 *   get:
 *     summary: Get products for a specific invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of invoice products
 *       401:
 *         description: Unauthorized
 */
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

// Delete invoice and its products by id
router.delete('/:id', auth, async (req, res) => {
  const invoiceId = req.params.id;
  try {
    // Delete invoice_products first
    await InvoiceProduct.destroy({ where: { invoice_id: invoiceId } });
    // Delete invoice
    const deleted = await Invoice.destroy({ where: { id: invoiceId } });
    if (deleted === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/invoice_products', auth, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    // Join InvoiceProduct with Product table
    const products = await InvoiceProduct.findAll({
      where: { invoice_id: invoiceId },
      include: [{
        model: require('../models/Product'),
        as: 'product',
        attributes: ['code', 'name', 'unit']
      }]
    });
    // Map to desired output
    const result = products.map(ip => ({
      code: ip.product?.code || '',
      name: ip.product?.name || '',
      unit: ip.product?.unit || '',
      price: ip.price,
      sell_qty: ip.sell_qty,
      totalValue: ip.totalValue
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:invoiceNumber', auth, async (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  console.log(invoiceNumber);
  
  const { client, location, discount, total, grandTotal, paymentStatus, paymentMode, products } = req.body;
  try {
    // Find and update invoice
    const invoice = await Invoice.findOne({ where: { 'id': invoiceNumber } });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.update({ client, location, discount, total, grandTotal, paymentStatus, paymentMode });
    // Optionally update products (delete old and add new)
    if (Array.isArray(products)) {
      await InvoiceProduct.destroy({ where: { invoice_id: invoice.id } });
      for (const prod of products) {
        await InvoiceProduct.create({
          invoice_id: invoice.id,
          product_id: prod.code,
          sell_qty: prod.sell_qty,
          price: prod.price,
          totalValue: prod.totalValue
        });
      }
    }
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;

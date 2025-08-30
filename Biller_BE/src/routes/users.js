/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all users (protected)
router.get('/', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query('SELECT id, username, role FROM users');
    conn.release();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user by ID (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { id } = req.params;
    await conn.query('DELETE FROM users WHERE id = ?', [id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user by ID (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const { id } = req.params;
    const { username, role } = req.body;
    await conn.query('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

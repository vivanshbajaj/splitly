const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Settlement = require('../models/Settlement');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/settlements/group/:groupId
// @desc    Get all settlements for a group
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/settlements
// @desc    Record a new settlement (someone paid back their debt)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { groupId, toUserId, amount, method } = req.body;

    if (!groupId || !toUserId || !amount) {
      return res.status(400).json({ message: 'Group, recipient, and amount are required' });
    }

    const settlement = await Settlement.create({
      group: groupId,
      from: req.user.id, // the person paying
      to: toUserId,      // the person receiving payment
      amount: parseFloat(amount),
      method: method || 'cash',
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('from', 'name email')
      .populate('to', 'name email');

    res.status(201).json(populatedSettlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

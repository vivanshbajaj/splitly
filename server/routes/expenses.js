const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/expenses/group/:groupId
// @desc    Get all expenses for a specific group
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 }); // newest first

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/expenses
// @desc    Add a new expense to a group (splits equally among all members)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { groupId, title, amount, category, notes } = req.body;

    if (!groupId || !title || !amount) {
      return res.status(400).json({ message: 'Group, title, and amount are required' });
    }

    // Get the group to know who the members are
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check that current user is a member
    const isMember = group.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Split equally but ensure total perfectly matches (fix penny drift)
    const perPersonAmount = parseFloat((amount / group.members.length).toFixed(2));
    const splits = [];
    let allocated = 0;
    
    for (let i = 0; i < group.members.length; i++) {
      let splitAmount = perPersonAmount;
      if (i === group.members.length - 1) {
        // The last person takes whatever is left to ensure exact total
        splitAmount = parseFloat((amount - allocated).toFixed(2));
      }
      splits.push({
        user: group.members[i]._id,
        amount: splitAmount,
      });
      allocated += splitAmount;
    }

    const expense = await Expense.create({
      group: groupId,
      title,
      amount: parseFloat(amount),
      category: category || 'other',
      paidBy: req.user.id,
      splits,
      notes: notes || '',
    });

    // Populate and return
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/expenses/:id
// @desc    Delete an expense (only the person who added it can delete)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the person who paid can delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

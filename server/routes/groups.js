const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/groups
// @desc    Get all groups the logged-in user is a member of
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // Find all groups where the current user is in the members array
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'name email')      // replace member IDs with actual user data
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });               // newest first

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, memberEmails } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Find users by their emails (so we can add them as members)
    let memberIds = [req.user.id]; // always include the creator

    if (memberEmails && memberEmails.length > 0) {
      // Filter out empty strings
      const validEmails = memberEmails.filter((e) => e && e.trim());
      const foundUsers = await User.find({ email: { $in: validEmails } });
      const foundIds = foundUsers.map((u) => u._id.toString());
      // Merge and deduplicate
      memberIds = [...new Set([req.user.id, ...foundIds])];
    }

    const group = await Group.create({
      name,
      type: type || 'other',
      members: memberIds,
      createdBy: req.user.id,
    });

    // Populate before returning so the frontend gets full user objects
    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/groups/:id
// @desc    Get a single group by its ID
// @access  Private (only members can view)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Security check: only members can see the group
    const isMember = group.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/groups/:id
// @desc    Delete a group (only the creator can)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the group creator can delete it' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

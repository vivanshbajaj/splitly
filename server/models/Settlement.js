const mongoose = require('mongoose');

// Settlement schema — records when someone pays back their debt
const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    // who is paying
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // who is receiving
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'other'],
      default: 'cash',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settlement', settlementSchema);

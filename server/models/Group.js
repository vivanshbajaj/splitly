const mongoose = require('mongoose');

// Group schema — a group has a name, type, and a list of member users
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['trip', 'home', 'office', 'event', 'other'],
      default: 'other',
    },
    // members is an array of User references (by their MongoDB _id)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // tells Mongoose to look in the User collection when we .populate()
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);

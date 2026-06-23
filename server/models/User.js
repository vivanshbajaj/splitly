const mongoose = require('mongoose');

// User schema — defines the shape of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // no two users can have the same email
      lowercase: true,    // always store email in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  {
    timestamps: true,   // automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('User', userSchema);

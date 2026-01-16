const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // We'll create User model later
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true // e.g., "daily", "twice a day"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  intakeLog: [{
    date: Date,
    taken: Boolean
  }]
}, {
  timestamps: true // auto adds createdAt, updatedAt
});

module.exports = mongoose.model('Medicine', medicineSchema);
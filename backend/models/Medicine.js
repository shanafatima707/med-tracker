
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, default: 0 },
  notes: String,
  intakeLog: [{
    date: { type: Date, default: Date.now },
    taken: { type: Boolean, default: true }
    // We can add more fields later: missedReason, notes, etc.
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });   // auto-updates updatedAt


module.exports = mongoose.model('Medicine', medicineSchema);
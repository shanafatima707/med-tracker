const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');

// POST /api/meds - Create a new medicine (protected)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating medicine for user:', req.user.email);

    const {
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      expiryDate,
      quantity,
      notes
    } = req.body;

    // Basic validation (add more as needed)
    if (!name || !dosage || !frequency || !expiryDate) {
      return res.status(400).json({ message: 'Required fields: name, dosage, frequency, expiryDate' });
    }

    const newMedicine = new Medicine({
      userId: req.user.id,          // Link to logged-in user
      name,
      dosage,
      frequency,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      expiryDate: new Date(expiryDate),
      quantity: quantity || 0,
      notes: notes || '',
      intakeLog: []                 // Empty log to start
    });

    await newMedicine.save();

    console.log('Medicine created:', newMedicine._id);

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine: newMedicine
    });

  } catch (err) {
    console.error('Error creating medicine:', err);
    res.status(500).json({ 
      message: 'Server error creating medicine',
      error: err.message 
    });
  }
});

// Optional: GET /api/meds - Get all medicines for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id })
      .sort({ expiryDate: 1 });  // Sort by expiry soonest first

    res.json({
      message: 'Medicines retrieved',
      count: medicines.length,
      medicines
    });
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
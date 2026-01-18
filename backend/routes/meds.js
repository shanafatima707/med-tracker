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

// GET /api/meds - Get user's medicines (with optional expiry filter)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Logged-in user ID:', req.user.id);
    const userId = req.user.id;
    let query = { userId };

    // Optional filter: ?expiringSoon=true → only medicines expiring in next 30 days
    const expiringSoon = req.query.expiringSoon === 'true';
    if (expiringSoon) {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      query.expiryDate = { $gte: today, $lte: thirtyDaysFromNow };
    }

    const medicines = await Medicine.find(query)
      .sort({ expiryDate: 1 });  // Soonest expiry first

    // Add simple warning to each medicine
    const medicinesWithWarnings = medicines.map(med => {
      const medObj = med.toObject(); // convert to plain JS object

      if (med.expiryDate) {
        const today = new Date();
        const daysLeft = Math.ceil((med.expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
          medObj.warning = 'Expired! Dispose safely';
        } else if (daysLeft <= 30) {
          medObj.warning = `Expires in ${daysLeft} days – consider refilling`;
        } else {
          medObj.warning = 'No immediate expiry concern';
        }
      } else {
        medObj.warning = 'No expiry date set';
      }

      return medObj;
    });

    res.json({
      message: 'Medicines retrieved',
      count: medicines.length,
      expiringSoonFilterApplied: expiringSoon,
      medicines: medicinesWithWarnings
    });

  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// PUT /api/meds/:id - Update a medicine (protected, only own medicines)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log(`Update request for medicine ID: ${req.params.id} by user: ${req.user.email}`);

    // Find the medicine by ID and make sure it belongs to this user
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medicine) {
      console.log('Medicine not found or not owned by user');
      return res.status(404).json({ message: 'Medicine not found or you do not have permission' });
    }

    // Allowed fields to update (prevent changing userId or _id)
    const allowedUpdates = [
      'name', 'dosage', 'frequency', 'startDate', 'endDate',
      'expiryDate', 'quantity', 'notes'
    ];

    // Loop through request body and only update allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'startDate' || key === 'endDate' || key === 'expiryDate') {
          medicine[key] = req.body[key] ? new Date(req.body[key]) : medicine[key];
        } else {
          medicine[key] = req.body[key];
        }
      }
    });

    // Save the updated document
    await medicine.save();

    console.log('Medicine updated successfully');

    res.json({
      message: 'Medicine updated successfully',
      medicine
    });

  } catch (err) {
    console.error('Error updating medicine:', err.message);
    res.status(500).json({
      message: 'Server error updating medicine',
      error: err.message
    });
  }
});

// DELETE /api/meds/:id - Delete a medicine (protected, only own medicines)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Delete request for medicine ID: ${req.params.id} by user: ${req.user.email}`);

    // Find and delete only if it belongs to this user
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medicine) {
      console.log('Medicine not found or not owned by user');
      return res.status(404).json({ message: 'Medicine not found or you do not have permission to delete it' });
    }

    console.log('Medicine deleted successfully');

    res.json({
      message: 'Medicine deleted successfully',
      deletedId: req.params.id
    });

  } catch (err) {
    console.error('Error deleting medicine:', err.message);
    res.status(500).json({
      message: 'Server error deleting medicine',
      error: err.message
    });
  }
});

// POST /api/meds/:id/log - Log a dose taken (protected, only own medicine)
router.post('/:id/log', auth, async (req, res) => {
  try {
    console.log(`Dose log request for medicine ID: ${req.params.id} by user: ${req.user.email}`);

    // Find the medicine (must belong to this user)
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medicine) {
      console.log('Medicine not found or not owned');
      return res.status(404).json({ message: 'Medicine not found or you do not have permission' });
    }

    // Optional: You can add request body validation later
    // For now: just push a new log entry with current time
    medicine.intakeLog.push({
      date: new Date(),
      taken: true
    });

    // Save the updated medicine
    await medicine.save();

    console.log('Dose logged successfully. Total logs now:', medicine.intakeLog.length);

    res.status(201).json({
      message: 'Dose logged successfully',
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        intakeLog: medicine.intakeLog   // return updated log array
      }
    });

  } catch (err) {
    console.error('Error logging dose:', err.message);
    res.status(500).json({
      message: 'Server error logging dose',
      error: err.message
    });
  }
});

module.exports = router;
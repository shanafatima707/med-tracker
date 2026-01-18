const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Medicine = require('../models/Medicine');

// POST /api/meds
router.post('/', authMiddleware, async (req, res) => {
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

    if (!name || !dosage || !frequency || !expiryDate) {
      return res.status(400).json({ message: 'Required fields: name, dosage, frequency, expiryDate' });
    }

    const newMedicine = new Medicine({
      userId: req.user.id,
      name,
      dosage,
      frequency,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      expiryDate: new Date(expiryDate),
      quantity: quantity || 0,
      notes: notes || '',
      intakeLog: []
    });

    await newMedicine.save();

    console.log('Medicine created:', newMedicine._id);

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine: newMedicine
    });

  } catch (err) {
    console.error('Error creating medicine:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/meds
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Logged-in user ID:', req.user.id);
    const userId = req.user.id;
    let query = { userId };

    const expiringSoon = req.query.expiringSoon === 'true';
    if (expiringSoon) {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      query.expiryDate = { $gte: today, $lte: thirtyDaysFromNow };
    }

    const medicines = await Medicine.find(query).sort({ expiryDate: 1 });

    const medicinesWithWarnings = medicines.map(med => {
      const medObj = med.toObject();

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
    console.error('Error fetching medicines:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/meds/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`Update request for ID: ${req.params.id} by ${req.user.email}`);

    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Not found or no permission' });
    }

    const allowed = ['name', 'dosage', 'frequency', 'startDate', 'endDate', 'expiryDate', 'quantity', 'notes'];

    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) {
        if (['startDate', 'endDate', 'expiryDate'].includes(key)) {
          medicine[key] = req.body[key] ? new Date(req.body[key]) : medicine[key];
        } else {
          medicine[key] = req.body[key];
        }
      }
    });

    await medicine.save();

    res.json({
      message: 'Updated successfully',
      medicine
    });

  } catch (err) {
    console.error('Update error:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/meds/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`Delete request for ID: ${req.params.id} by ${req.user.email}`);

    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Not found or no permission' });
    }

    res.json({
      message: 'Deleted successfully',
      deletedId: req.params.id
    });

  } catch (err) {
    console.error('Delete error:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/meds/:id/log
// GET /api/meds/:id/logs - Get intake log history for a medicine (protected)
router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    console.log(`Fetching logs for medicine ID: ${req.params.id} by user: ${req.user.email}`);

    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('name intakeLog');  // Only fetch name + logs (efficient)

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found or no permission' });
    }

    const logs = medicine.intakeLog || [];

    // Simple summary stats
    const takenCount = logs.filter(log => log.taken).length;
    const missedCount = logs.length - takenCount;
    const compliancePercent = logs.length > 0 ? Math.round((takenCount / logs.length) * 100) : 0;

    res.json({
      message: 'Intake logs retrieved',
      medicineName: medicine.name,
      totalLogs: logs.length,
      takenCount,
      missedCount,
      compliancePercent,
      logs: logs.sort((a, b) => new Date(b.date) - new Date(a.date))  // Newest first
    });

  } catch (err) {
    console.error('Error fetching logs:', err.stack);
    res.status(500).json({ message: 'Server error fetching logs', error: err.message });
  }
});

module.exports = router;
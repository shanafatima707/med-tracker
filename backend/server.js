const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User');
const Medicine = require('./models/Medicine');

dotenv.config(); // This loads your .env file (MONGO_URI & PORT)

const app = express();

// Allow frontend to connect later (CORS - temporary open for testing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected successfully! 🎉'))
  .catch((err) => console.log('MongoDB connection error:', err.message));

// Simple test route
app.get('/', (req, res) => {
  res.send('Hello from Medicine Tracker Backend! Database is connected.');
});

const PORT = process.env.PORT || 5000;

// Temporary test route to save a dummy medicine
// app.get('/test-save-med', async (req, res) => {
//   try {
//     // Create a dummy user first (just for testing — we'll remove later)
//     const dummyUser = await User.create({
//       name: 'Test User',
//       email: 'test@example.com',
//       password: 'test123' // plain text for now — we'll hash later
//     });

//     // Save a dummy medicine linked to this user
//     const dummyMed = await Medicine.create({
//       userId: dummyUser._id,
//       name: 'Paracetamol',
//       dosage: '500mg',
//       frequency: 'Twice daily',
//       startDate: new Date('2026-01-01'),
//       endDate: new Date('2026-03-01'),
//       expiryDate: new Date('2026-06-30'),  // expiry tracking!
//       quantity: 20,
//       notes: 'For fever/headache',
//       intakeLog: [
//         { date: new Date(), taken: true }
//       ]
//     });

//     res.send(`Dummy medicine saved successfully! ID: ${dummyMed._id}`);
//   } catch (err) {
//     res.status(500).send('Error saving dummy data: ' + err.message);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
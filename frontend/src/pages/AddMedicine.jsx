import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AddMedicine() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    expiryDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/meds', formData);
      setSuccess('Medicine added successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Add error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add medicine – check required fields'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8 text-center">
          Add New Medicine
        </h1>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 text-green-700 font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Medicine Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Paracetamol"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Dosage *</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 500mg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Frequency *</label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Twice daily"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Expiry Date *</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg text-white font-bold transition ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Adding...' : 'Add Medicine'}
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 text-indigo-600 hover:underline block mx-auto font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
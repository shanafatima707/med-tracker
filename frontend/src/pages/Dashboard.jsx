import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMedicines = async () => {
      try {
        const response = await api.get('/meds');

        // Safe extraction to always get an array
        let medsList = response.data;
        if (Array.isArray(medsList)) {
          setMedicines(medsList);
        } else if (medsList && Array.isArray(medsList.medicines)) {
          setMedicines(medsList.medicines);
        } else if (medsList && Array.isArray(medsList.data)) {
          setMedicines(medsList.data);
        } else {
          setMedicines([]); // fallback
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-700">Med Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Your Medicines</h2>
          <Link to="/add-medicine">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow transition">
              + Add Medicine
            </button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-xl text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-center text-xl">{error}</p>
        ) : medicines.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              No medicines added yet
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Add your first medicine to start tracking.
            </p>
            <Link to="/add-medicine">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-xl shadow-md transition">
                + Add Medicine
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((med) => {
              const days = daysUntil(med.expiryDate);
              const expired = days <= 0;
              const soon = days > 0 && days <= 30;

              return (
                <div
                  key={med._id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-t-4 ${
                    expired ? 'border-red-600' :
                    soon ? 'border-yellow-500' :
                    'border-green-500'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {med.name}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Dosage:</span> {med.dosage || '—'}</p>
                    <p><span className="font-medium">Frequency:</span> {med.frequency || '—'}</p>
                    <p><span className="font-medium">Expiry:</span> {new Date(med.expiryDate).toLocaleDateString()}</p>
                    {days !== null && (
                      <p className={`font-semibold ${expired ? 'text-red-600' : soon ? 'text-yellow-600' : 'text-green-600'}`}>
                        {expired ? 'Expired!' : `${days} day${days === 1 ? '' : 's'} left`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
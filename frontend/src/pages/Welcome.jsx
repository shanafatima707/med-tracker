// src/pages/Welcome.jsx
import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-indigo-700 mb-6">
          Welcome to Med Tracker
        </h1>
        <p className="text-xl text-gray-700 mb-10">
          Track your medicines, get expiry reminders, log intake, and stay compliant.
        </p>

        <div className="space-y-4">
          <Link to="/login">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition shadow-md">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-xl text-lg transition shadow-md">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
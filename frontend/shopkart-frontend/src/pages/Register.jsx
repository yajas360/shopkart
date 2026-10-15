import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
    };

    if (!cleanData.fullName || !cleanData.email || !cleanData.password || !cleanData.phone) {
      setError('All fields are required.');
      return;
    }

    if (cleanData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/customers/register', cleanData);
      await checkAuth();
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080D18] p-4 text-[#EAF2FF]">
      <div className="max-w-md w-full bg-[#111B2E] rounded-3xl shadow-2xl shadow-black/60 p-8 sm:p-10 border border-[#1E2D4A]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-[#080D18] font-black text-xl mx-auto mb-3 shadow-lg shadow-[#3B82F6]/25">
            SK
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
            Create an Account
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Join ShopKart and start shopping today
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-[#080D18] border border-[#1E2D4A] rounded-xl text-[#EAF2FF] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[#080D18] border border-[#1E2D4A] rounded-xl text-[#EAF2FF] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 bg-[#080D18] border border-[#1E2D4A] rounded-xl text-[#EAF2FF] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 bg-[#080D18] border border-[#1E2D4A] rounded-xl text-[#EAF2FF] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 outline-none transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-[#EAF2FF] font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 disabled:opacity-40 cursor-pointer text-sm mt-2"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#60A5FA] hover:underline font-semibold">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
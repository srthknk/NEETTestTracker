'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@neet.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FontAwesomeIcon
              icon={faBook}
              className="text-2xl text-black"
            />
            <h1 className="text-3xl font-semibold text-black">RankForge</h1>
          </div>
          <p className="text-gray-600">
            Master your NEET preparation with data-driven insights
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-xl font-semibold text-black mb-6">Login</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@neet.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white rounded-sm font-medium hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p className="mb-1">Email: <span className="font-mono font-semibold">admin@neet.com</span></p>
            <p>Password: <span className="font-mono font-semibold">admin123</span></p>
          </div>
        </form>
      </div>
    </div>
  );
}

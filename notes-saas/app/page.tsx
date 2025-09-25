'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        router.push('/notes');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong!');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Box Effect for Form */}
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        {error && (
          <p className="text-red-600 font-medium mt-3 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

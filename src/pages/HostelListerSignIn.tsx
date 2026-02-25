import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '@/components/Navbar';

export default function HostelListerSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'agent' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!role) {
      setError('Please select your role.');
      setLoading(false);
      return;
    }

    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        setError(result.error.message);
      } else {
        setMessage('Signed in successfully.');
        // Redirect to dashboard for agents
        setTimeout(() => {
          if (role === 'agent') navigate('/dashboard');
          else navigate('/');
        }, 500);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-md rounded-lg p-6"
          aria-busy={loading}
          aria-describedby="form-status"
        >
          <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="accent-sky-600"
                />
                Student looking for hostel
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="agent"
                  checked={role === 'agent'}
                  onChange={() => setRole('agent')}
                  className="accent-sky-600"
                />
                Agent/Hostel Lister
              </label>
            </div>
          </div>

          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 mb-4 block w-full rounded border px-3 py-2"
          />

          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative mt-1 mb-4">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div id="form-status" className="mt-4" aria-live="polite">
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-sm text-green-600">
                {message}
              </p>
            )}
          </div>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-700 hover:underline">Register</Link>
          </div>
        </form>
      </main>
    </>
  );
}

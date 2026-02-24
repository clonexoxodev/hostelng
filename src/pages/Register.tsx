import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '@/components/Navbar'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp(
        { email, password },
        { data: { full_name: fullName, phone } }
      )
      if (error) {
        setError(error.message)
      } else {
        setMessage('Registration successful. Check your email to confirm your account.')
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
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
        aria-describedby="register-status"
      >
        <h1 className="text-2xl font-semibold mb-4">Create an account</h1>

        <label htmlFor="fullName" className="block text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 mb-4 block w-full rounded border px-3 py-2"
        />

        <label htmlFor="phone" className="block text-sm font-medium">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 mb-4 block w-full rounded border px-3 py-2"
          pattern="[0-9]{10,15}"
          placeholder="e.g. 08012345678"
        />

        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
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
            minLength={6}
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

        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm password
        </label>
        <div className="relative mt-1 mb-4">
          <input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded border px-3 py-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <div id="register-status" className="mt-4" aria-live="polite">
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
          Already have an account?{' '}
          <Link to="/login" className="text-sky-700 hover:underline">Sign in</Link>
        </div>
        </form>
      </main>
    </>
  )
}

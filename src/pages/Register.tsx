import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
      const { data, error } = await supabase.auth.signUp({ email, password }, { data: { full_name: fullName } })
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
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 mb-4 block w-full rounded border px-3 py-2"
        />

        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 mb-4 block w-full rounded border px-3 py-2"
        />

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
      </form>
    </main>
  )
}

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error) {
        setError(result.error.message)
      } else {
        setMessage('Signed in successfully.')
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
        aria-describedby="form-status"
      >
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

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
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 mb-4 block w-full rounded border px-3 py-2"
        />

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
      </form>
    </main>
  )
}

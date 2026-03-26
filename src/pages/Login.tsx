import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '@/components/Navbar'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm'
const labelCls = 'block text-sm font-semibold text-foreground mb-1.5'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || null
  const reason = searchParams.get('reason') || null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        const role = data.user?.user_metadata?.role
        const userEmail = data.user?.email
        if (returnTo) {
          navigate(decodeURIComponent(returnTo))
        } else if (userEmail === 'clonexoxo80@gmail.com') {
          navigate('/superadmin')
        } else if (role === 'agent') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
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
      <main className="min-h-screen flex items-center justify-center p-6 pt-28 bg-background">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your HostelNG account</p>
            {reason === 'save' && (
              <div className="mt-4 px-4 py-3 bg-primary/8 border border-primary/20 rounded-xl text-sm text-primary font-medium">
                Sign in to save listings and access them anytime.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">

            <div>
              <label htmlFor="email" className={labelCls}>
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                Email Address
              </label>
              <input id="email" type="email" required autoComplete="email" autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                className={inputCls} placeholder="you@email.com" />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>
                <Lock className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                Password
              </label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} required
                  autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`} placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                <span className="text-red-500 text-sm">✕</span>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 gradient-primary border-0 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity text-sm">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <><LogIn className="w-4 h-4" /> Sign In</>
              }
            </button>

          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to={returnTo ? `/register?returnTo=${returnTo}` : '/register'} className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>

        </div>
      </main>
    </>
  )
}

import React, { useState } from 'react'
import { Eye, EyeOff, GraduationCap, Building2, ArrowLeft, CheckCircle2, Loader2, User, Phone, Mail, Lock, Briefcase, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '@/components/Navbar'

type Role = 'student' | 'agent' | ''
type Step = 'pick-role' | 'form'

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm'
const labelCls = 'block text-sm font-semibold text-foreground mb-1.5'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('pick-role')
  const [role, setRole] = useState<Role>('')

  // Shared fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Agent-only fields
  const [businessName, setBusinessName] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function pickRole(r: Role) {
    setRole(r)
    setStep('form')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const metadata: Record<string, string> = { full_name: fullName, phone, role }
      if (role === 'agent') {
        if (businessName) metadata.business_name = businessName
        if (experience) metadata.experience = experience
        if (bio) metadata.bio = bio
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Check your email to confirm, then sign in.')
        setTimeout(() => navigate('/login'), 2500)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 1: Role picker ──────────────────────────────────────────────────
  if (step === 'pick-role') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center p-6 pt-28 bg-background">
          <div className="w-full max-w-lg">
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join HostelNG</h1>
              <p className="text-muted-foreground text-sm">Choose how you want to use the platform</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student card */}
              <button
                onClick={() => pickRole('student')}
                className="group flex flex-col items-center text-center gap-4 p-8 bg-card border-2 border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-foreground mb-1">I'm a Student</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Browse listings, contact property owners, and find your perfect student accommodation.
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Quick signup — 1 min
                </span>
              </button>

              {/* Property owner card */}
              <button
                onClick={() => pickRole('agent')}
                className="group flex flex-col items-center text-center gap-4 p-8 bg-card border-2 border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Building2 className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-foreground mb-1">I'm a Property Owner / Agent</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    For landlords, agents, and property managers who want to list available housing.
                  </p>
                </div>
                <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                  Free to list
                </span>
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </main>
      </>
    )
  }

  // ── Step 2: Registration form ────────────────────────────────────────────
  const isAgent = role === 'agent'

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center p-6 pt-28 bg-background">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => { setStep('pick-role'); setError(null) }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAgent ? 'bg-accent/10' : 'bg-primary/10'}`}>
                {isAgent ? <Building2 className="w-5 h-5 text-accent" /> : <GraduationCap className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {isAgent ? 'Property Owner / Agent Registration' : 'Student Registration'}
                </h1>
                <p className="text-muted-foreground text-xs">
                  {isAgent
                    ? 'A few extra details help students trust your listings'
                    : 'Quick and easy — takes less than a minute'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Basic info section */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</p>

              <div>
                <label htmlFor="fullName" className={labelCls}>
                  <User className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                  Full Name *
                </label>
                <input id="fullName" type="text" required value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={inputCls} placeholder="e.g. Adebayo Okonkwo" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className={labelCls}>
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Phone Number *
                  </label>
                  <input id="phone" type="tel" required value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputCls} placeholder="08012345678"
                    pattern="[0-9]{10,15}" />
                </div>
                <div>
                  <label htmlFor="email" className={labelCls}>
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Email Address *
                  </label>
                  <input id="email" type="email" required autoComplete="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputCls} placeholder="you@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className={labelCls}>
                    <Lock className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Password *
                  </label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} required minLength={6}
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={`${inputCls} pr-10`} placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide' : 'Show'}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className={labelCls}>
                    <Lock className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input id="confirm" type={showConfirm ? 'text' : 'password'} required
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      className={`${inputCls} pr-10`} placeholder="Repeat password" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? 'Hide' : 'Show'}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent-only section */}
            {isAgent && (
              <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lister Profile</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Optional — helps students trust your listings</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="businessName" className={labelCls}>
                      <Briefcase className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                      Business / Brand Name
                    </label>
                    <input id="businessName" type="text" value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      className={inputCls} placeholder="e.g. Ade Properties" />
                  </div>
                  <div>
                    <label htmlFor="experience" className={labelCls}>
                      Years of Experience
                    </label>
                    <select id="experience" value={experience}
                      onChange={e => setExperience(e.target.value)}
                      className={inputCls}>
                      <option value="">Select...</option>
                      <option value="less_than_1">Less than 1 year</option>
                      <option value="1_2">1 – 2 years</option>
                      <option value="3_5">3 – 5 years</option>
                      <option value="5_plus">5+ years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className={labelCls}>
                    <FileText className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Short Description
                  </label>
                  <textarea id="bio" rows={3} value={bio}
                    onChange={e => setBio(e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="Tell students a bit about yourself — your experience, the areas you cover, and why they should trust your listings." />
                </div>
              </div>
            )}

            {/* Status messages */}
            <div aria-live="polite">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <span className="text-red-500 text-sm">✕</span>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 gradient-primary border-0 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity text-sm">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <><CheckCircle2 className="w-4 h-4" /> Create {isAgent ? 'Lister' : 'Student'} Account</>
              }
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>

          </form>
        </div>
      </main>
    </>
  )
}

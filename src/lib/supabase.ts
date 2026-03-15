import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Fallback placeholders prevent createClient from throwing on missing env vars
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_* env variables are not set. Supabase auth will fail until configured.')
  console.log('Current env:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? 'SET' : 'NOT SET' })
} else {
  console.log('✅ Supabase configured:', { url: supabaseUrl })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default supabase

// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 1) Пробваме първо ENV (Vercel/Vite):
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// 2) Резервни стойности (твоя URL + anon key) — за всеки случай:
const fallbackUrl = 'https://xftcqzihjoqezqowbbdc.supabase.co'
const fallbackKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdGNxemloam9xZXpxb3diYmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODEzNzIsImV4cCI6MjA3MDg1NzM3Mn0.4fS1Soc5Q2D0OL5uUozAU_w2RIQibn6PBS9JDKyMrRc'

// 3) Финални (ENV или fallback). НЕ хвърляме грешка, само предупреждаваме.
const supabaseUrl = envUrl || fallbackUrl
const supabaseAnonKey = envKey || fallbackKey

if (!envUrl || !envKey) {
  console.warn('Using fallback Supabase credentials (ENV not set in Vercel).')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export default supabase

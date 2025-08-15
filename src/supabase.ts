// src/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 1) Първо пробваме да вземем от ENV (Vercel/Vite):
const envUrl  = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// 2) Ако липсват, ползваме твоите стойности като резервен вариант:
const fallbackUrl = 'https://xftcqzihjoqezqowbbdc.supabase.co'
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdGNxemloam9xZXpxb3diYmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODEzNzIsImV4cCI6MjA3MDg1NzM3Mn0.4fS1Soc5Q2D0OL5uUozAU_w2RIQibn6PBS9JDKyMrRc'

// 3) Финални стойности (ENV или fallback):
const supabaseUrl = envUrl || fallbackUrl
const supabaseAnonKey = envKey || fallbackKey

// (по желание) лог за дебъг ако нямаш ENV във Vercel
if (!envUrl || !envKey) {
  console.warn('Using fallback Supabase credentials from code (ENV not set).')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase

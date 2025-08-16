import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu(){
  const nav = useNavigate()
  const [profile,setProfile] = useState<Profile | null>(null)

  useEffect(()=>{
    (async () => {
      // Вземаме сигурно user.id; ако го няма — НЕ правим заявка към profiles
      const { data: { user }, error: uerr } = await supabase.auth.getUser()
      if (uerr) { console.error('auth.getUser error:', uerr); return }
      if (!user?.id) { return }

      const { data, error } = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', user.id)     // ← само ако имаме user.id
        .maybeSingle()

      if (error) {
        console.error('load profile error:', error)
      } else {
        setProfile(data as Profile | null)
      }
    })()
  },[])

  const logout = async ()=>{ await supabase.auth.signOut(); nav('/', { replace:true }) }

  const uname  = profile?.username ?? null
  const tokens = profile?.tokens ?? 0

  r

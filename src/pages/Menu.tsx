import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu(){
  const nav = useNavigate()
  const [profile,setProfile] = useState<Profile | null>(null)

  useEffect(()=>{
    (async () => {
      const { data: { user }, error: uerr } = await supabase.auth.getUser()
      if (uerr) { console.error('auth.getUser error:', uerr); return }
      if (!user?.id) return

      // 1) Опит за зареждане
      let { data, error } = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', user.id)
        .maybeSingle()

      // 2) Ако няма ред – създай го с разумни стойности и зареди отново
      if (!data) {
        const fallbackName =
          (user.user_metadata && (user.user_metadata as any).username) ||
          (user.email ? user.email.split('@')[0] : null)

        const { error: upErr } = await supabase
          .from('profiles')
          .upsert({ user_id: user.id, username: fallbackName || null }, { onConflict: 'user_id' })

        if (upErr) { console.error('profiles upsert error:', upErr) }

        const r2 = await supabase
          .from('profiles')
          .select('username,tokens,avatar')
          .eq('user_id', user.id)
          .maybeSingle()

        data = r2.data
        error = r2.error
      }

      if (error) console.error('load profile error:', error)
      setProfile((data as Profile) ?? { username: null, tokens: 0 })
    })()
  },[])

  const logout = async ()=>{ await supabase.auth.signOut(); nav('/', { replace:true }) }

  const uname  = profile?.username ?? ''
  const tokens = profile?.tokens ?? 0

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>

        {/* Инфо лента: САМО username и истинските токени */}
        <div className="card" style={{display:'flex',gap:12,alignItems:'center'}}>
          <span><b>Профил:</b> {uname || <span style={{opacity:.75}}>нямаш зададен username</span>}</span>
          <span style={{opacity:.35}}>|</span>
          <span><b>Токени:</b> {tokens}</span>
        </div>

        <div c

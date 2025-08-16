import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register(){
  const nav = useNavigate()
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [email,setEmail]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const [hasSession,setHasSession]=useState(false)

  // ако вече има сесия (напр. след предишен опит) — да знаем да не викаме пак signUp
  useEffect(()=>{ supabase.auth.getSession().then(({data})=>setHasSession(!!data.session)) },[])

  const onRegister = async (e:React.FormEvent)=>{
    e.preventDefault()
    setErr('')
    setLoading(true)

    // 0) Мини валидация
    if(username.trim().length < 3){ setErr('Username трябва да е поне 3 символа.'); setLoading(false); return }

    // 1) Проверка дали username е свободен (преди да правим каквото и да е)
    try {
      const { data: avail } = await supabase.rpc('is_username_available', { p_username: username })
      if (avail === false) {
        setErr('Това потребителско име е заето. Избери друго.')
        setLoading(false)
        return
      }
    } catch {
      // ако функцията липсва — ще хванем дубликата при upsert
    }

    // 2) Ако НЯМА сесия → създаваме акаунт (email дубликат ще върне грешка тук)
    if (!hasSession) {
      const { data: sign, error: signErr } = await supabase.auth.signUp({ email, password })
      if (signErr) {
        const msg = (signErr.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
          setErr('Този имейл вече е регистриран. Влез от „имам профил“.')
        } else {
          setErr(signErr.message)
        }
        setLoading(false)
        return
      }
      // ако email confirmations са включени, логваме директно с паролата
      if (!sign.session) {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (loginErr) {
          setErr('Провери имейла и потвърди регистрацията, след това влез от „имам профил“.')
          setLoading(false)
          return
        }
      }
    }

    // 3) Upsert на профила (тук вече има сесия)
    const me = await supabase.auth.getUser()
    if (me.data.user) {
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert({ user_id: me.data.user.id, username }, { onConflict: 'user_id' })
      if (upErr) {
        // дружелюбно съобщение за дубликат
        if (upErr.code === '23505' || /duplicate|unique/i.test(upErr.message)) {
          setErr('Това потребителско име вече е заето. Избери друго.')
        } else {
          setErr(upErr.message)
        }
        setLoading(false)
        return
      }
    }

    setLoading(false)
    nav('/menu', { replace: true })
  }

  return (
    <div className="container" style={{paddingTop:40}}>
      <div style={{maxWidth:420, margin:'0 auto'}}>
        <h2 style={{textAlign:'center', marginBottom:16}}>СЕГА СИ ПРАВЯ ПРОФИЛ</h2>
        <form className="card" onSubmit={onRegister}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} required />
          <div style={{height:8}}/>
          <input placeholder="парола" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div style={{height:8}}/>
          <input placeholder="имейл" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <div style={{height:12}}/>
          <button className="primary" type="submit" disabled={loading}>{loading?'Създавам…':'Създай'}</button>
          {err && <div className="alert error" style={{marginTop:12}}>{err}</div>}
          <div style={{marginTop:8}}>
            <button type="button" className="link" onClick={()=>nav('/')}>Назад</button>
          </div>
        </form>
      </div>
    </div>
  )
}

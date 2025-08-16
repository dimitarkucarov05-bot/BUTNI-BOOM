import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register(){
  const nav = useNavigate()
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [email,setEmail]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)

  const onRegister = async (e:React.FormEvent)=>{
    e.preventDefault()
    setErr('')
    setLoading(true)

    // 1) Създаваме акаунт
    const { data: sign, error: signErr } = await supabase.auth.signUp({ email, password })
    if (signErr) { setErr(signErr.message); setLoading(false); return }

    // 2) Ако има сесия веднага (email confirmations OFF) → директно продължаваме.
    let session = sign.session

    // 2.1) Ако НЯМА сесия (email confirmations ON), пробваме вход веднага.
    // Забележка: ако Supabase изисква потвърждение по имейл, входът ще върне грешка.
    if (!session) {
      const { data: login, error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) {
        setLoading(false)
        setErr('Провери имейла и потвърди регистрацията, след това влез от "имам профил".')
        return
      }
      session = login.session
    }

    // 3) Тук вече ИМА активна сесия → правим upsert в profiles за текущия user
    const me = await supabase.auth.getUser()
    if (me.data.user) {
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert({ user_id: me.data.user.id, username }, { onConflict: 'user_id' })
      if (upErr) {
        // по-приятно съобщение за отнето име
        if (upErr.code === '23505' || /duplicate/i.test(upErr.message)) {
          setErr('Това потребителско име вече е заето. Избери друго.')
        } else {
          setErr(upErr.message)
        }
        setLoading(false)
        return
      }
    }

    setLoading(false)
    // 4) Успех → към менюто
    nav('/menu', { replace: true })
  }

  return (
    <div className="container" style={{paddingTop:40}}>
      <div style={{maxWidth:420, margin:'0 auto'}}>
        <h2 style={{textAlign:'center', marginBottom:16}}>СЕГА СИ ПРАВЯ ПРОФИЛ</h2>
        <form className="card" onSubmit={onRegister}>
          <input
            placeholder="username"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            required
          />
          <div style={{height:8}}/>
          <input
            placeholder="парола"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
          <div style={{height:8}}/>
          <input
            placeholder="имейл"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
          <div style={{height:12}}/>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Създавам…' : 'Създай'}
          </button>

          {err && <div className="alert error" style={{marginTop:12}}>{err}</div>}

          <div style={{marginTop:8}}>
            <button type="button" className="link" onClick={()=>nav('/')}>Назад</button>
          </div>
        </form>
      </div>
    </div>
  )
}

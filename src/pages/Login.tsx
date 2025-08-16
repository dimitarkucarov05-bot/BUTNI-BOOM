import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState('')

  const onLogin = async (e:React.FormEvent)=>{
    e.preventDefault(); setErr('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if(error){ setErr('Объркана парола или имейл.'); return }
    if(data.user) nav('/menu',{replace:true})
  }

  return (
    <div className="container" style={{paddingTop:40}}>
      <div style={{maxWidth:420, margin:'0 auto'}}>
        <h2 style={{textAlign:'center', marginBottom:16}}>ВХОД В СЪЩЕСТВУВАЩ ПРОФИЛ</h2>
        <form className="card" onSubmit={onLogin}>
          <input placeholder="имейл" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <div style={{height:8}}/>
          <input placeholder="парола" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div style={{height:12}}/>
          <button className="primary" type="submit">Вход</button>
          {err && <div className="alert error" style={{marginTop:12}}>{err}</div>}
          <div style={{marginTop:8}}><button type="button" className="link" onClick={()=>nav('/')}>Назад</button></div>
        </form>
      </div>
    </div>
  )
}

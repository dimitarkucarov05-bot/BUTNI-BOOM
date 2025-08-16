import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register(){
  const nav = useNavigate()
  const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [email,setEmail]=useState(''); const [err,setErr]=useState('')

  const onRegister = async (e:React.FormEvent)=>{
    e.preventDefault(); setErr('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if(error){ setErr(error.message); return }
    if(data.user){
      await supabase.from('profiles').upsert({ user_id:data.user.id, username }, { onConflict:'user_id' })
      nav('/menu',{replace:true})
    }
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
          <button className="primary" type="submit">Създай</button>
          {err && <div className="alert error" style={{marginTop:12}}>{err}</div>}
          <div style={{marginTop:8}}><button type="button" className="link" onClick={()=>nav('/')}>Назад</button></div>
        </form>
      </div>
    </div>
  )
}

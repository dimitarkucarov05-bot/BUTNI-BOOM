
import React, { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState<'login'|'signup'>('signup')
  const [msg, setMsg] = useState<string>('')

  const handle = async () => {
    setMsg('')
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        const user = data.user
        if (user) {
          await supabase.from('profiles').upsert({ user_id: user.id, username })
        }
        setMsg('Успешна регистрация. Можеш да влезеш.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMsg('Влязъл си.')
      }
    } catch(e:any) {
      setMsg(e.message || 'Грешка')
    }
  }

  return (
    <div className="container">
      <h1>{mode==='signup' ? 'Регистрация' : 'Вход'}</h1>
      <div className="card">
        <div className="form-row">
          <input placeholder="Имейл" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Парола" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {mode==='signup' && (
          <div className="form-row">
            <input placeholder="Потребителско име" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
        )}
        <div className="form-row">
          <button onClick={handle}>{mode==='signup'?'Регистрирай':'Влез'}</button>
          <button onClick={()=>setMode(mode==='signup'?'login':'signup')}>
            {mode==='signup'?'Имаш акаунт? Влез':'Нямаш акаунт? Регистрирай се'}
          </button>
        </div>
        {msg && <div className="alert">{msg}</div>}
      </div>
    </div>
  )
}

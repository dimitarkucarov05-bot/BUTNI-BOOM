import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    if (username.trim().length < 3) {
      setErr('Username трябва да е поне 3 символа.')
      setLoading(false)
      return
    }

    try {
      // 1) Проверка за свободен username (ако имаш функцията)
      try {
        const { data: avail } = await supabase.rpc('is_username_available', { p_username: username })
        if (avail === false) {
          setErr('Това потребителско име е заето. Избери друго.')
          setLoading(false)
          return
        }
      } catch (_) {
        // ако функцията липсва, ще хванем конфликта при upsert
      }

      // 2) Реален signUp – тук Supabase спира дубликат email
      const { data: s1, error: e1 } = await supabase.auth.signUp({ email, password })
      if (e1) {
        const msg = (e1.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
          throw new Error('Този имейл вече е регистриран. Влез от „имам профил“.')
        }
        throw e1
      }

      // 3) Ако няма активна сесия след signUp (email confirm ON) – опитай вход
      if (!s1.session) {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password })
        if (e2) {
          throw new Error('Провери имейла и потвърди регистрацията, след това влез от „имам профил“.')
        }
      }

      // 4) Гарантирано имаме сесия – запис в profiles (upsert по user_id)
      const { data: me } = await supabase.auth.getUser()
      const uid = me.user?.id
      if (!uid) throw new Error('Невалидна сесия след регистрация.')

      const { data: prof, error: upErr } = await supabase
        .from('profiles')
        .upsert({ user_id: uid, username }, { onConflict: 'user_id' })
        .select('user_id,username')
        .single()

      if (upErr) {
        if (upErr.code === '23505' || /duplicate|unique/i.test(upErr.message)) {
          throw new Error('Това потребителско име вече е заето. Избери друго.')
        }
        throw upErr
      }

      // 5) Успех → към менюто
      nav('/menu', { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Неуспешна регистрация.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 16 }}>СЕГА СИ ПРАВЯ ПРОФИЛ</h2>
        <form className="card" onSubmit={onRegister}>
          <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} required />
          <div style={{ height: 8 }} />
          <input placeholder="парола" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <div style={{ height: 8 }} />
          <input placeholder="имейл" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <div style={{ height: 12 }} />
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Създавам…' : 'Създай'}</button>
          {err && <div className="alert error" style={{ marginTop: 12 }}>{err}</div>}
          <div style={{ marginTop: 8 }}>
            <button type="button" className="link" onClick={() => nav('/')}>Назад</button>
          </div>
        </form>
      </div>
    </div>
  )
}


import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [tokens, setTokens] = useState<number>(0)
  const [history, setHistory] = useState<any[]>([])

  const load = async () => {
    const u = (await supabase.auth.getUser()).data.user
    setUser(u)
    if (!u) return
    const { data: prof } = await supabase.from('profiles').select('tokens, username').eq('user_id', u.id).single()
    setTokens(prof?.tokens ?? 0)
    const { data: ledger } = await supabase.from('token_ledger').select('delta, reason, created_at').eq('user_id', u.id).order('created_at', { ascending:false }).limit(20)
    setHistory(ledger || [])
  }

  useEffect(()=>{ load() }, [])

  const logout = async ()=>{ await supabase.auth.signOut(); location.href='/auth' }

  return (
    <div className="container">
      <h1>Профил</h1>
      {user ? (
        <>
          <div className="card">
            <div><b>Имейл:</b> {user.email}</div>
            <div><b>Токени:</b> {tokens}</div>
          </div>
          <h3>История</h3>
          <table className="table">
            <thead><tr><th>Дата</th><th>Промяна</th><th>Причина</th></tr></thead>
            <tbody>
              {history.map((h,i)=>(
                <tr key={i}>
                  <td>{new Date(h.created_at).toLocaleString()}</td>
                  <td>{h.delta > 0 ? `+${h.delta}` : h.delta}</td>
                  <td>{h.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={logout}>Изход</button>
        </>
      ) : <div>Не си логнат.</div>}
    </div>
  )
}

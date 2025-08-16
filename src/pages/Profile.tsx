import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Profile(){
  const nav = useNavigate()
  const [loading,setLoading] = useState(true)
  const [err,setErr] = useState('')
  const [ok,setOk] = useState('')

  const [username,setUsername] = useState('')   // ← реалното име от БД
  const [tokens,setTokens]     = useState(0)    // информативно
  const [avatar,setAvatar]     = useState<string | null>(null)

  useEffect(()=>{
    (async ()=>{
      setErr(''); setOk('')
      const { data: me } = await supabase.auth.getUser()
      if(!me.user){ nav('/auth',{replace:true}); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', me.user.id)
        .single()

      if (error) { setErr(error.message) }
      else {
        setUsername(data?.username ?? '')
        setTokens(data?.tokens ?? 0)
        setAvatar(data?.avatar ?? null)
      }
      setLoading(false)
    })()
  },[nav])

  const save = async ()=>{
    setErr(''); setOk('')
    const { data: me } = await supabase.auth.getUser()
    if(!me.user) return

    const { error } = await supabase
      .from('profiles')
      .update({ username, avatar })
      .eq('user_id', me.user.id)

    if (error) {
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        setErr('Това потребителско име вече е заето. Избери друго.')
      } else {
        setErr(error.message)
      }
      return
    }
    setOk('Профилът е запазен.')
  }

  if (loading) return null

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div className="card">
          <h3 style={{marginTop:0}}>Профил</h3>

          <label style={{display:'block', marginBottom:6}}>Потребителско име</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="напр. mitko20" />

          <div style={{height:10}} />

          <label style={{display:'block', marginBottom:6}}>Аватар (emoji или URL)</label>
          <input value={avatar ?? ''} onChange={e=>setAvatar(e.target.value || null)} placeholder="🧿 или https://..." />

          <div style={{height:10}} />
          <div>Токени: <b>{tokens}</b></div>

          <div style={{height:14}} />
          <button className="primary" onClick={save}>Запази</button>
          <button style={{marginLeft:8}} onClick={()=>nav('/menu')}>Назад</button>

          {ok  && <div className="alert success" style={{marginTop:12}}>{ok}</div>}
          {err && <div className="alert error"   style={{marginTop:12}}>{err}</div>}
        </div>
      </div>
    </div>
  )
}

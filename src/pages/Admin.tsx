
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

type Code = { id?:string; name:string; lat:number; lng:number; radius_m?:number; is_active?:boolean; activation_time?:string|null }

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS as string || '').split(',').map(s=>s.trim()).filter(Boolean)

export default function Admin() {
  const [me, setMe] = useState<any>(null)
  const [list, setList] = useState<Code[]>([])
  const [form, setForm] = useState<Code>({ name:'', lat:43.2141, lng:27.9147, radius_m:60, is_active:false, activation_time:'' })
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    supabase.auth.getUser().then(r=>setMe(r.data.user))
  }, [])

  const isAdmin = me && adminEmails.includes(me.email)

  const load = async ()=>{
    const { data } = await supabase.from('qr_codes').select('*').order('created_at', { ascending:false })
    setList(data || [])
  }
  useEffect(()=>{ if(isAdmin) load() }, [isAdmin])

  const save = async ()=>{
    setMsg('')
    const { error } = await supabase.from('qr_codes').insert({
      name: form.name,
      lat: form.lat,
      lng: form.lng,
      radius_m: form.radius_m ?? 60,
      is_active: form.is_active ?? false,
      activation_time: form.activation_time || null
    })
    if (error) setMsg(error.message); else { setMsg('Добавено.'); setForm({ name:'', lat:43.2141, lng:27.9147, radius_m:60, is_active:false, activation_time:'' }); load() }
  }

  const del = async (id:string)=>{
    await supabase.from('qr_codes').delete().eq('id', id)
    load()
  }

  const toggleActive = async (id:string, current:boolean)=>{
    await supabase.from('qr_codes').update({ is_active: !current }).eq('id', id)
    load()
  }

  if (!me) return <div className="container">Зареждане...</div>
  if (!isAdmin) return <div className="container"><div className="alert error">Достъп само за администратори.</div></div>

  return (
    <div className="container">
      <h1>Админ – QR локации</h1>
      <div className="card">
        <h3>Нов QR код (локация)</h3>
        <div className="form-row">
          <input placeholder="Име (напр. Траката)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <input placeholder="Lat" type="number" step="0.000001" value={form.lat} onChange={e=>setForm({...form, lat:parseFloat(e.target.value)})}/>
          <input placeholder="Lng" type="number" step="0.000001" value={form.lng} onChange={e=>setForm({...form, lng:parseFloat(e.target.value)})}/>
          <input placeholder="Радиус (м)" type="number" value={form.radius_m} onChange={e=>setForm({...form, radius_m:parseInt(e.target.value)})}/>
        </div>
        <div className="form-row">
          <label>Активиране в (по избор):</label>
          <input type="datetime-local" value={form.activation_time as any} onChange={e=>setForm({...form, activation_time:e.target.value})}/>
          <label><input type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})}/> Активен</label>
          <button onClick={save}>Добави</button>
        </div>
        {msg && <div className="alert success">{msg}</div>}
      </div>

      <h3>Списък</h3>
      <table className="table">
        <thead><tr><th>Име</th><th>Координати</th><th>Радиус</th><th>Активен</th><th>Активиране</th><th>Действия</th></tr></thead>
        <tbody>
          {list.map(x=> (
            <tr key={x.id}>
              <td>{x.name}</td>
              <td>{x.lat.toFixed(6)}, {x.lng.toFixed(6)}</td>
              <td>{x.radius_m}</td>
              <td>{String(x.is_active)}</td>
              <td>{x.activation_time ? new Date(x.activation_time).toLocaleString() : '-'}</td>
              <td>
                <button onClick={()=>toggleActive(x.id!, !!x.is_active)}>Toggle</button>
                <button onClick={()=>del(x.id!)}>Изтрий</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

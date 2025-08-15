import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Menu(){
  const nav = useNavigate()
  const [me,setMe] = useState<any>(null)
  const [profile,setProfile]=useState<any>(null)

  useEffect(()=>{
    supabase.auth.getUser().then(async r=>{
      setMe(r.data.user)
      if(r.data.user){
        const { data } = await supabase.from('profiles').select('username,tokens,role').eq('user_id', r.data.user.id).single()
        setProfile(data)
      }
    })
  },[])

  const logout = async ()=>{
    await supabase.auth.signOut()
    nav('/',{replace:true})
  }

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div className="tiles">
          <div className="tile" onClick={()=>nav('/profile')} style={{cursor:'pointer'}}>
            АВАТАР
          </div>
          <div className="tile" onClick={()=>nav('/map')} style={{cursor:'pointer'}}>
            КАРТА
          </div>
          <div className="tile" onClick={()=>nav('/scan')} style={{cursor:'pointer'}}>
            СКАНИРАЙ
          </div>
          <div className="tile locked" title="Заключено за потребители"></div>
        </div>

        <div className="card" style={{marginTop:20}}>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <div><b>Профил:</b> {profile?.username || me?.email}</div>
            <div><b>Токени:</b> {profile?.tokens ?? 0}</div>
          </div>
        </div>

        <button style={{marginTop:12}} onClick={logout}>изход</button>
      </div>
    </div>
  )
}

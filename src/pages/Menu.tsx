import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Menu(){
  const nav = useNavigate()
  const [me,setMe]=useState<any>(null); const [profile,setProfile]=useState<any>(null)

  useEffect(()=>{ supabase.auth.getUser().then(async r=>{
    setMe(r.data.user)
    if(r.data.user){
      const { data } = await supabase.from('profiles').select('username,tokens,avatar').eq('user_id', r.data.user.id).single()
      setProfile(data)
    }
  }) },[])

  const logout = async ()=>{ await supabase.auth.signOut(); nav('/',{replace:true}) }

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div className="tiles">
          <div className="tile" onClick={()=>nav('/profile')} style={{cursor:'pointer',flexDirection:'column'}}>
            {profile?.avatar?.startsWith('/')
              ? <img src={profile.avatar} alt="avatar" className="avatar-thumb" style={{width:72,height:72,marginBottom:8}}/>
              : <span style={{fontSize:40,marginBottom:8}}>{profile?.avatar ?? '🧿'}</span>}
            АВАТАР
          </div>
          <div className="tile" onClick={()=>nav('/map')} style={{cursor:'pointer'}}>КАРТА</div>
          <div className="tile" onClick={()=>nav('/scan')} style={{cursor:'pointer'}}>СКАНИРАЙ</div>
          <div className="tile locked" title="Заключено за потребители"></div>
        </div>

        <div className="card" style={{marginTop:20}}>
          <b>Профил:</b> {profile?.username || me?.email} &nbsp; | &nbsp; <b>Токени:</b> {profile?.tokens ?? 0}
        </div>

        <button style={{marginTop:12}} onClick={logout}>изход</button>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu(){
  const nav = useNavigate()
  const [me,setMe] = useState<any>(null)
  const [profile,setProfile] = useState<Profile | null>(null)

  useEffect(()=>{
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      setMe(u.user)
      if (u.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username,tokens,avatar')
          .eq('user_id', u.user.id)
          .maybeSingle()
        setProfile(data as Profile | null)
      }
    })()
  },[])

  const logout = async ()=>{ await supabase.auth.signOut(); nav('/', { replace:true }) }

  const uname = profile?.username ?? null
  const tokens = profile?.tokens ?? 0

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>

        {/* Инфо лента: показваме САМО username */}
        <div className="card" style={{display:'flex',gap:12,alignItems:'center'}}>
          <span><b>Профил:</b> {uname ? uname : <span style={{opacity:.75}}>нямаш зададен username</span>}</span>
          <span style={{opacity:.35}}>|</span>
          <span><b>Токени:</b> {tokens}</span>
        </div>

        {/* Плочки / меню */}
        <div className="tiles">
          <div className="tile" onClick={()=>nav('/profile')} style={{cursor:'pointer',flexDirection:'column'}}>
            {profile?.avatar?.startsWith('/')
              ? <img src={profile.avatar!} alt="avatar" className="avatar-thumb" style={{width:72,height:72,marginBottom:8}}/>
              : <span style={{fontSize:40,marginBottom:8}}>{profile?.avatar ?? '🧿'}</span>}
            АВАТАР
          </div>

          <div className="tile" onClick={()=>nav('/map')} style={{cursor:'pointer'}}>КАРТА</div>
          <div className="tile" onClick={()=>nav('/scan')} style={{cursor:'pointer'}}>СКАНИРАЙ</div>
          <div className="tile locked" title="Заключено за потребители"></div>
        </div>

        <button style={{marginTop:12}} onClick={logout}>изход</button>
      </div>
    </div>
  )
}

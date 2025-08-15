import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const choices = ['🦾','🧿','🦊','🐉','👾','🎭']

export default function Profile(){
  const nav = useNavigate()
  const [p,setP]=useState<any>(null)
  const [tokens,setTokens]=useState(0)
  const [avatar,setAvatar]=useState<string>('🧿')

  useEffect(()=>{
    supabase.auth.getUser().then(async r=>{
      if(!r.data.user) return
      const { data } = await supabase.from('profiles').select('username,tokens,avatar').eq('user_id', r.data.user.id).single()
      setP(data)
      setTokens(data?.tokens ?? 0)
      setAvatar(data?.avatar ?? localStorage.getItem('avatar') ?? '🧿')
    })
  },[])

  const saveAvatar = async (a:string)=>{
    setAvatar(a)
    // пробваме да пазим в базата, ако колоната липсва — локално
    const me = await supabase.auth.getUser()
    if(me.data.user){
      const { error } = await supabase.from('profiles').update({ avatar:a }).eq('user_id', me.data.user.id)
      if(error){ localStorage.setItem('avatar',a) }
    } else {
      localStorage.setItem('avatar',a)
    }
  }

  const level = Math.max(1, Math.floor(tokens/100)+1)

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:92, lineHeight:1}}>{avatar}</div>
          <div className="form-row" style={{justifyContent:'center', marginTop:12}}>
            {choices.map(c=>(
              <button key={c} onClick={()=>saveAvatar(c)} style={{width:56}}>{c}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="form-row">
            <div className="tile" style={{height:56, fontSize:18}}><b>USERNAME</b>&nbsp; {p?.username ?? '—'}</div>
            <div className="tile" style={{height:56, fontSize:18}}><b>ЛЕВЕЛ</b>&nbsp; {level}</div>
            <div className="tile" style={{height:56, fontSize:18}}><b>ТОКЕНИ</b>&nbsp; {tokens}</div>
          </div>
        </div>

        <div style={{textAlign:'right'}}>
          <button className="link" onClick={()=>nav('/menu')}>назад</button>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Choice = { label:string, value:string }
const choices: Choice[] = [
  { label:'Img1', value:'/avatars/a1.png' },
  { label:'Img2', value:'/avatars/a2.png' },
  { label:'Img3', value:'/avatars/a3.png' },
  { label:'Emoji', value:'🧿' }, { label:'Emoji', value:'👾' },
]

export default function Profile(){
  const nav = useNavigate()
  const [p,setP]=useState<any>(null); const [tokens,setTokens]=useState(0); const [avatar,setAvatar]=useState<string>('🧿')

  useEffect(()=>{ supabase.auth.getUser().then(async r=>{
    if(!r.data.user) return
    const { data } = await supabase.from('profiles').select('username,tokens,avatar').eq('user_id', r.data.user.id).single()
    setP(data); setTokens(data?.tokens ?? 0); setAvatar(data?.avatar ?? '🧿')
  }) },[])

  const saveAvatar = async (val:string)=>{
    setAvatar(val)
    const me = await supabase.auth.getUser()
    if(me.data.user){ await supabase.from('profiles').update({ avatar:val }).eq('user_id', me.data.user.id) }
  }

  const level = Math.max(1, Math.floor(tokens/100)+1)
  const isImg = avatar.startsWith('/')

  return (
    <div className="container" style={{paddingTop:16}}>
      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div className="card" style={{textAlign:'center'}}>
          {isImg ? <img src={avatar} alt="avatar" className="avatar-img"/> : <div style={{fontSize:92,lineHeight:1}}>{avatar}</div>}
          <div className="form-row" style={{justifyContent:'center',marginTop:12}}>
            {choices.map((c,i)=>(
              <button key={i} onClick={()=>saveAvatar(c.value)} style={{width:'auto',padding:'8px 10px'}}>
                {c.value.startsWith('/') ? <img src={c.value} alt={c.label} className="avatar-thumb"/> : c.value}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="form-row">
            <div className="tile" style={{height:56,fontSize:18}}><b>USERNAME</b>&nbsp;{p?.username ?? '—'}</div>
            <div className="tile" style={{height:56,fontSize:18}}><b>ЛЕВЕЛ</b>&nbsp;{level}</div>
            <div className="tile" style={{height:56,fontSize:18}}><b>ТОКЕНИ</b>&nbsp;{tokens}</div>
          </div>
        </div>

        <div style={{textAlign:'right'}}><button className="link" onClick={()=>nav('/menu')}>назад</button></div>
      </div>
    </div>
  )
}

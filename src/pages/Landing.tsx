import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Landing(){
  const nav = useNavigate()

  // Ако вече има активна сесия, директно в менюто
  React.useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (data.session) nav('/menu', { replace: true })
    })
  }, [nav])

  return (
    <div className="container" style={{paddingTop:60}}>
      <div style={{maxWidth:420, margin:'0 auto'}}>
        <div className="card" style={{textAlign:'center'}}>
          <h2 style={{marginBottom:20}}>BUTNI BOOM</h2>
          <button className="primary" style={{fontSize:24, marginBottom:16}} onClick={()=>nav('/auth')}>
            имам профил
          </button>
          <button style={{fontSize:22}} onClick={()=>nav('/register')}>
            нямам профил
          </button>
        </div>
      </div>
    </div>
  )
}

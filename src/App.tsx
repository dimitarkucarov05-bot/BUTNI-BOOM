import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Menu from './pages/Menu'
import Profile from './pages/Profile'
import MapPage from './pages/Map'
import Scan from './pages/Scan'
import { supabase } from './supabase'

function RequireAuth({children}:{children:React.ReactNode}) {
  const [ready, setReady] = React.useState(false)
  const [authed, setAuthed] = React.useState(false)
  React.useEffect(()=>{
    supabase.auth.getUser().then(r=>{
      setAuthed(!!r.data.user); setReady(true)
    })
  },[])
  if(!ready) return null
  return authed ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/auth" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/menu" element={<RequireAuth><Menu/></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>} />
        <Route path="/map" element={<RequireAuth><MapPage/></RequireAuth>} />
        <Route path="/scan" element={<RequireAuth><Scan/></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

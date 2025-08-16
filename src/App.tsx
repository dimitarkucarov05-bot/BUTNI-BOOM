import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Landing  from './pages/Landing.tsx'
import Login    from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Menu     from './pages/Menu.tsx'
import Profile  from './pages/Profile.tsx'
import MapPage  from './pages/Map.tsx'
import Scan     from './pages/Scan.tsx'

import { supabase } from './supabase'

/** По-надежден гард: следи реално сесията и обновява при логин/логaут */
function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)
  const [session, setSession] = React.useState<import('@supabase/supabase-js').Session | null>(null)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return null
  return session ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/auth"     element={<Login   />} />
        <Route path="/register" element={<Register/>} />

        <Route path="/menu"    element={<AuthGate><Menu/></AuthGate>} />
        <Route path="/profile" element={<AuthGate><Profile/></AuthGate>} />
        <Route path="/map"     element={<AuthGate><MapPage/></AuthGate>} />
        <Route path="/scan"    element={<AuthGate><Scan/></AuthGate>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

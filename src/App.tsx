
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

export default function App() {
  const loc = useLocation()
  const nav = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(r => setUser(r.data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user && loc.pathname !== '/auth') nav('/auth')
  }, [user, loc.pathname])

  return (
    <div>
      <Outlet/>

      <nav className="bottom">
        <Link to="/">Карта</Link>
        <Link to="/scan">Сканирай</Link>
        <Link to="/profile">Профил</Link>
      </nav>
    </div>
  )
}

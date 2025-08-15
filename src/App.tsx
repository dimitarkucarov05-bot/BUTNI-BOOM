import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// 🚩 ВАЖНО: слагам .tsx разширение, за да няма "Could not resolve" в билда
import Landing  from './pages/Landing.tsx'
import Login    from './pages/Login.tsx'
import Register from './pages/Register.tsx'

// Ако вече имаш тези страници – остави ги.
// Ако още ги нямаш, можеш временно да махнеш тези 4 реда/роути.
// import Menu     from './pages/Menu.tsx'
// import Profile  from './pages/Profile.tsx'
// import MapPage  from './pages/Map.tsx'
// import Scan     from './pages/Scan.tsx'

import { supabase } from './supabase'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)
  const [authed, setAuthed] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then((r) => {
      setAuthed(!!r.data.user)
      setReady(true)
    })
  }, [])

  if (!ready) return null
  return authed ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ако вече имаш тези страници – разкоментирай ги
        <Route path="/menu" element={<RequireAuth><Menu /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
        <Route path="/scan" element={<RequireAuth><Scan /></RequireAuth>} />
        */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

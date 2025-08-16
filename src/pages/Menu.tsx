import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu(): JSX.Element {
  const nav = useNavigate()
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)

      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user?.id) { setLoading(false); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!ignore) {
        if (error) console.error('load profile error:', error)
        setProfile((data as Profile) ?? { username: null, tokens: 0 })
        setLoading(false)
      }
    })()

    return () => { ignore = true }
  }, [])

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    nav('/', { replace: true })
  }

  const username = profile?.username ?? ''
  const tokens   = profile?.tokens ?? 0

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Инфо лента */}
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span><b>Профил:</b> {loading ? 'зареждане…' : (username || <span style={{ opacity: 0.75 }}>нямаш зададен username</span>)}</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span><b>Токени:</b> {loading ? '…' : tokens}</span>
        </div>

        {/* Плочки */}
        <div className="tiles">
          <div className="tile" onClick={() => nav('/profile')} style={{ cursor: 'pointer' }}>
            АВАТАР
          </div>
          <div className="tile" onClick={() => nav('/map')} style={{ cursor: 'pointer' }}>
            КАРТА
          </div>
          <div className="tile" onClick={() => nav('/scan')} style={{ cursor: 'pointer' }}>
            СКАНИРАЙ
          </div>
          <div className="tile locked" title="Заключено">?</div>
        </div>

        <button style={{ marginTop: 12 }} onClick={logout}>изход</button>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user }, error: uerr } = await supabase.auth.getUser()
      if (uerr) { console.error('auth.getUser error:', uerr); return }
      if (!user?.id) return

      // Зареди профила (само ако има user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled) {
        if (error) {
          console.error('load profile error:', error)
          setProfile({ username: null, tokens: 0 })
        } else {
          setProfile((data as Profile) ?? { username: null, tokens: 0 })
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    nav('/', { replace: true })
  }

  const uname  = profile?.username ?? ''
  const tokens = profile?.tokens ?? 0

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Инфо лента */}
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span><b>Профил:</b> {uname || <span style={{ opacity: .75 }}>нямаш зададен username</span>}</span>
          <span style={{ opacity: .35 }}>|</span>
          <span><b>Токени:</b> {tokens}</span>
        </div>

        {/* Плочки */}
        <div className="tiles">
          <div
            className="tile"
            onClick={() => nav('/profile')}
            style={{ cursor: 'pointer', flexDirection: 'column' }}
          >
            {profile?.avatar?.startsWith('/')
              ? (
                <img
                  src={profile.avatar!}
                  alt="avatar"
                  className="avatar-thumb"
                  style={{ width: 72, height: 72, marginBottom: 8 }}
                />
              )
              : <span style={{ fontSize: 40, marginBottom: 8 }}>{profile?.avatar ?? '🧿'}</span>
            }
            АВАТАР
          </div>

          <div className="tile" onClick={() => nav('/map')}  style={{ cursor: 'pointer' }}>КАРТА</div>
          <div className="tile" onClick={() => nav('/scan')} style={{ cursor: 'pointer' }}>СКАНИРАЙ</div>
          <div className="tile locked" title="Заключено за потребители">?</div>
        </div>

        <button style={{ marginTop: 12 }} onClick={logout}>изход</button>
      </div>
    </div>
  )
}

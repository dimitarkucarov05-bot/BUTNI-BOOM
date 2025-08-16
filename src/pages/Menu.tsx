import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

type Profile = { username: string | null; tokens: number | null; avatar?: string | null }

export default function Menu() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)

      const { data: { user }, error: uerr } = await supabase.auth.getUser()
      if (uerr) { console.error('auth.getUser error:', uerr); setLoading(false); return }
      if (!user?.id) { setLoading(false); return }

      // 1) първи опит да вземем профила
      const r1 = await supabase
        .from('profiles')
        .select('username,tokens,avatar')
        .eq('user_id', user.id)
        .maybeSingle()

      let data = r1.data as Profile | null
      if (!data) {
        // 2) ако няма ред – създаваме ред с разумни стойности (само веднъж)
        const fallbackName =
          (user.user_metadata && (user.user_metadata as any).username) ||
          (user.email ? user.email.split('@')[0] : null)

        const up = await supabase
          .from('profiles')
          .upsert({ user_id: user.id, username: fallbackName || null }, { onConflict: 'user_id' })
        if (up.error) console.error('profiles upsert error:', up.error)

        const r2 = await supabase
          .from('profiles')
          .select('username,tokens,avatar')
          .eq('user_id', user.id)
          .maybeSingle()

        data = r2.data as Profile | null
      }

      if (!cancelled) {
        if (r1.error) console.error('load profile error:', r1.error)
        setProfile(data ?? { username: null, tokens: 0 })
        setLoading(false)
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
          <span><b>Профил:</b> {loading ? 'зареждане…' : (uname || <span style={{ opacity: .75 }}>нямаш зададен username</span>)}</span>
          <span style={{ opacity: .35 }}>|</span>
          <span><b>Токени:</b> {loading ? '…' : tokens}</span>
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

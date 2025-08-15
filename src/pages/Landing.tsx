import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 20 }}>BUTNI BOOM</h2>

          <button
            className="primary"
            style={{ fontSize: 24, marginBottom: 16 }}
            onClick={() => nav('/auth')}
          >
            имам профил
          </button>

          <button style={{ fontSize: 22 }} onClick={() => nav('/register')}>
            нямам профил
          </button>
        </div>
      </div>
    </div>
  )
}

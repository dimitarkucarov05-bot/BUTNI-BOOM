import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

declare global {
  interface Window {
    Html5Qrcode: any
  }
}

export default function Scan() {
  const nav = useNavigate()
  const divRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<any>(null)

  const [status, setStatus] = useState('Готов за сканиране')
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState('')
  const [result, setResult] = useState<{ rank: number; tokens: number; message: string } | null>(null)

  useEffect(() => {
    start()
    return () => { stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function start() {
    setErr('')
    setResult(null)

    const Html5Qrcode = (window as any).Html5Qrcode
    if (!Html5Qrcode) {
      setErr('Липсва библиотеката за сканиране. Добави <script src="https://unpkg.com/html5-qrcode"></script> в index.html.')
      return
    }
    if (!divRef.current) return

    // затвори стара инстанция ако има
    if (qrRef.current) {
      try { await qrRef.current.stop() } catch {}
      try { await qrRef.current.clear() } catch {}
      qrRef.current = null
    }

    try {
      qrRef.current = new Html5Qrcode(divRef.current.id)
      setRunning(true)
      setStatus('Скенерът работи… насочи към QR')
      await qrRef.current.start(
        { facingMode: 'environment' },    // задна камера
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        () => {}                          // игнор дребни грешки
      )
    } catch (e: any) {
      setRunning(false)
      setStatus('Скенерът е спрян')
      setErr(e?.message || 'Неуспешно стартиране на камерата. Разреши достъп до камерата.')
    }
  }

  async function stop() {
    if (qrRef.current) {
      try { await qrRef.current.stop() } catch {}
      try { await qrRef.current.clear() } catch {}
      qrRef.current = null
    }
    setRunning(false)
    setStatus('Скенерът е спрян')
  }

  async function onScanSuccess(text: string) {
    await stop() // спираме скенера след първо успешно четене
    setStatus('Обработвам…')
    setErr('')
    setResult(null)

    const qrId = extractQrId(text)
    if (!qrId) {
      setErr('QR съдържанието е невалидно. Очаквам UUID или ?id=<uuid>.')
      return
    }

    // задължително изискваме локация (функцията в SQL ползва lat/lng)
    const pos = await getPosition()
    if (!pos) {
      setErr('Разреши достъп до Локация, за да валидираме, че си на място.')
      return
    }

    try {
      const { data: me } = await supabase.auth.getUser()
      if (!me.user) { setErr('Моля, влез в профила си.'); return }

      const { data, error } = await supabase.rpc('claim_qr_code', {
        p_qr_code_id: qrId,
        p_user_id: me.user.id,
        p_lat: pos.coords.latitude,
        p_lng: pos.coords.longitude
      })
      if (error) throw error

      const r = Array.isArray(data) && data[0] ? data[0] : data
      setResult({
        rank: r?.rank ?? 0,
        tokens: r?.awarded_tokens ?? 0,
        message: r?.message ?? ''
      })
      setStatus('Готово')
    } catch (e: any) {
      setErr(e?.message || 'Възникна грешка при заявката.')
    }
  }

  function extractQrId(s: string): string | null {
    // 1) директно UUID
    const m = s.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
    if (m) return m[0]
    // 2) URL с ?id=<uuid>
    try {
      const url = new URL(s)
      const id = url.searchParams.get('id')
      if (id && /^[0-9a-fA-F-]{36}$/.test(id)) return id
    } catch {}
    // 3) префикс "qr:" или "butni:"
    const m2 = s.match(/(?:qr:|butni:)([0-9a-fA-F-]{36})/i)
    if (m2) return m2[1]
    return null
  }

  function getPosition(): Promise<GeolocationPosition | null> {
    return new Promise(resolve => {
      if (!('geolocation' in navigator)) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        p => resolve(p),
        _ => resolve(null),
        { enableHighAccuracy: true, timeout: 12000 }
      )
    })
  }

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>СКАНИРАЙ QR</h3>

          <div
            id="qr-reader"
            ref={divRef}
            style={{ width: '100%', minHeight: 260, borderRadius: 12, overflow: 'hidden' }}
          />

          <div style={{ height: 8 }} />
          <div style={{ fontSize: 13, opacity: .8 }}>{status}</div>

          <div className="form-row" style={{ marginTop: 12 }}>
            {!running ? (
              <button className="primary" onClick={start}>Старт</button>
            ) : (
              <button onClick={stop}>Стоп</button>
            )}
            <button onClick={() => nav('/menu')}>Меню</button>
          </div>
        </div>

        {result && (
          <div className="card" style={{ borderColor: '#10b981' }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{result.message}</div>
            <div>Ранг: <b>{result.rank}</b> &nbsp; | &nbsp; Токени: <b>{result.tokens}</b></div>
            <div style={{ marginTop: 10 }}>
              <button className="primary" onClick={start}>Сканирай отново</button>
            </div>
          </div>
        )}

        {err && <div className="alert error" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      {/* плаващо меню долу вляво, както искаше */}
      <div className="overlay-menu">
        <button onClick={() => nav('/menu')}>меню</button>
      </div>
    </div>
  )
}


import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../supabase'

export default function ScanPage() {
  const ref = useRef<HTMLDivElement>(null)
  const [msg, setMsg] = useState('Насочи камерата към QR кода.')
  const [running, setRunning] = useState(false)

  useEffect(()=>{
    let scanner: Html5Qrcode | null = null
    const start = async () => {
      if (!ref.current) return
      scanner = new Html5Qrcode(ref.current.id)
      setRunning(true)
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try {
            setMsg('Разчетено, проверявам...')
            let codeId = ''
            try {
              const obj = JSON.parse(decodedText)
              codeId = obj.code_id || ''
            } catch {
              codeId = decodedText
            }
            if (!navigator.geolocation) throw new Error('Локацията не е налична.')
            await new Promise<void>((resolve,reject)=>{
              navigator.geolocation.getCurrentPosition(async (pos)=>{
                try {
                  const user = (await supabase.auth.getUser()).data.user
                  if (!user) throw new Error('Не си логнат.')
                  const { data, error } = await supabase.rpc('claim_qr_code', {
                    p_qr_code_id: codeId,
                    p_user_id: user.id,
                    p_lat: pos.coords.latitude,
                    p_lng: pos.coords.longitude
                  })
                  if (error) throw error
                  const res = Array.isArray(data) ? data[0] : data
                  setMsg(res?.message || 'Готово.')
                } catch(e:any) {
                  setMsg(e.message || 'Грешка при заявки.')
                }
                resolve()
              }, err=>{ setMsg('Няма достъп до локация.'); reject(err) }, { enableHighAccuracy:true, timeout:10000 })
            })
          } catch(e:any) {
            setMsg(e.message || 'Грешка при сканиране.')
          } finally {
            try { await scanner?.stop() } catch {}
            setRunning(false)
          }
        },
        (errorMessage) => {}
      )
    }
    start()
    return () => { try { scanner?.stop() } catch {}; try { scanner?.clear() } catch {} }
  }, [])

  return (
    <div className="container">
      <h1>Сканирай QR</h1>
      <div id="qr-reader" ref={ref} style={{ width: '100%', maxWidth: 400, margin:'0 auto' }}></div>
      <div className="card">{msg}</div>
      {!running && <button onClick={()=>location.reload()}>Сканирай отново</button>}
    </div>
  )
}

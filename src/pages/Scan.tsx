import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

declare global { interface Window { Html5QrcodeScanner:any } }

export default function Scan(){
  const nav = useNavigate()
  const divRef = useRef<HTMLDivElement>(null)
  const [err,setErr]=useState<string>('')

  useEffect(()=>{
    if(window.Html5QrcodeScanner){
      const scanner = new window.Html5QrcodeScanner(divRef.current!.id, { fps:10, qrbox:250 })
      scanner.render((text:string)=>{ 
        try{ const obj = JSON.parse(text); alert('Сканирано! code_id: '+obj.code_id) }catch{ alert('QR: '+text) }
      }, (e:any)=>{})
      return ()=>scanner.clear()
    }else{
      setErr('Скенерът не е наличен. (Нужен е html5-qrcode)') 
    }
  },[])

  return (
    <div className="container" style={{paddingTop:12}}>
      <h2>СКАНИРАЙ</h2>
      {err ? <div className="alert error">{err}</div> : <div id="qr-box" ref={divRef} className="card" style={{height:360}}/>}
      <div className="overlay-menu">
        <button onClick={()=>nav('/menu')}>меню</button>
      </div>
    </div>
  )
}

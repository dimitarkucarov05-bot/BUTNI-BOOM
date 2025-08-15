import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

dayjs.extend(duration as any)

type Code = { id:string; name:string; lat:number; lng:number; activation_time:string|null; is_active:boolean }

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})

const BG_CENTER: [number, number] = [42.7339, 25.4858]
const INITIAL_ZOOM = 7
const TARGET_ZOOM = 16

export default function MapPage(){
  const nav = useNavigate()
  const [codes,setCodes]=useState<Code[]>([])
  const [now,setNow]=useState(new Date())
  const [myPos,setMyPos]=useState<[number,number]|null>(null)
  const [map,setMap]=useState<L.Map|null>(null)
  const centeredOnce = useRef(false)

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t)},[])
  useEffect(()=>{ (async()=>{
    const {data}=await supabase.from('qr_codes').select('id,name,lat,lng,activation_time,is_active').order('name'); setCodes(data||[])
  })() },[])

  useEffect(()=>{
    if(!('geolocation' in navigator)) return
    const id = navigator.geolocation.watchPosition(
      p=>{
        const pos:[number,number]=[p.coords.latitude,p.coords.longitude]
        setMyPos(pos)
        if(map && !centeredOnce.current){ map.flyTo(pos,TARGET_ZOOM,{animate:true}); centeredOnce.current=true }
      },
      ()=>{},
      { enableHighAccuracy:true, maximumAge:2000, timeout:15000 }
    )
    return ()=>navigator.geolocation.clearWatch(id)
  },[map])

  return (
    <div>
      <MapContainer center={myPos??BG_CENTER as any} zoom={myPos?TARGET_ZOOM:INITIAL_ZOOM} minZoom={6}
        scrollWheelZoom style={{height:'calc(100vh - 56px)'}} whenCreated={setMap}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {codes.map(x=>{
          const active=x.is_active||(!!x.activation_time&&dayjs(x.activation_time).isBefore(dayjs()))
          const diff=x.activation_time?dayjs(x.activation_time).diff(dayjs(now)):0
          const d=dayjs.duration(diff)
          return(
            <Marker key={x.id} position={[x.lat,x.lng]} icon={markerIcon}>
              <Popup>
                <b>{x.name}</b><br/>
                {active? <span className="badge">Активен</span> :
                 x.activation_time ? <span>Старт след: {d.asMilliseconds()>0?`${d.hours()}ч ${d.minutes()}м ${d.seconds()}с`:'скоро…'}</span> :
                 <span>Очаква активация</span>}
              </Popup>
            </Marker>
          )
        })}
        {myPos && <CircleMarker center={myPos} radius={8} pathOptions={{color:'#19a7a7',fillColor:'#19a7a7',fillOpacity:1}}/>}
      </MapContainer>

      <div className="overlay-menu">
        <button onClick={()=>nav('/menu')}>меню</button>
      </div>
    </div>
  )
}

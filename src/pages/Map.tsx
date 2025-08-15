import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { supabase } from '../supabase'

dayjs.extend(duration as any)

type Code = { id:string; name:string; lat:number; lng:number; activation_time:string|null; is_active:boolean }

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})

// Център на България
const BG_CENTER: [number, number] = [42.7339, 25.4858]

export default function MapPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [now, setNow] = useState<Date>(new Date())
  const [myPos, setMyPos] = useState<[number, number] | null>(null)
  const [acc, setAcc] = useState<number>(0)
  const [geoMsg, setGeoMsg] = useState<string>('')

  // само за еднократно авто-центриране към играча
  const [map, setMap] = useState<L.Map | null>(null)
  const [centeredOnce, setCenteredOnce] = useState(false)

  useEffect(()=>{ const t = setInterval(()=>setNow(new Date()), 1000); return ()=>clearInterval(t) },[])

  // Зареждане на QR локациите
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('qr_codes')
        .select('id,name,lat,lng,activation_time,is_active')
        .order('name')
      setCodes(data || [])
    })()
  }, [])

  // Проследяване на МОЯТА позиция (само локално в браузъра)
  useEffect(() => {
    if (!('geolocation' in navigator)) { setGeoMsg('Устройството няма геолокация.'); return }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyPos([pos.coords.latitude, pos.coords.longitude])
        setAcc(pos.coords.accuracy || 0)
        setGeoMsg('')
      },
      (err) => setGeoMsg(err.message || 'Грешка при геолокация.'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Центрирай към играча САМО веднъж (при първа валидна позиция)
  useEffect(() => {
    if (map && myPos && !centeredOnce) {
      map.setView(myPos, 16)
      setCenteredOnce(true)
    }
  }, [map, myPos, centeredOnce])

  return (
    <div style={{ position:'relative' }}>
      <MapContainer
        center={BG_CENTER as any}
        zoom={7}
        minZoom={6}
        scrollWheelZoom={true}
        style={{height:'calc(100vh - 56px)'}}
        whenCreated={setMap}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Маркери на QR кодовете */}
        {codes.map(x=>{
          const active = x.is_active || (!!x.activation_time && dayjs(x.activation_time).isBefore(dayjs()))
          const diff = x.activation_time ? dayjs(x.activation_time).diff(dayjs(now)) : 0
          const d = dayjs.duration(diff)
          return (
            <Marker key={x.id} position={[x.lat,x.lng]} icon={markerIcon}>
              <Popup>
                <div>
                  <b>{x.name}</b><br/>
                  {active ? <span className="badge">Активен</span> :
                    x.activation_time ? <span>Старт след: {d.asMilliseconds()>0?`${d.hours()}ч ${d.minutes()}м ${d.seconds()}с`:'скоро...'}</span> :
                    <span>Очаква активация</span>}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* МОЯТА движеща се позиция (само за мен, не се праща към сървър) */}
        {myPos && (
          <>
            <CircleMarker center={myPos} radius={8} pathOptions={{ color:'#2563eb', fillColor:'#3b82f6', fillOpacity:1 }} />
            {acc > 0 && <Circle center={myPos} radius={acc} pathOptions={{ color:'#60a5fa', fillOpacity:0.1 }} />}
          </>
        )}
      </MapContainer>

      {geoMsg && <div className="alert error" style={{position:'absolute',bottom:70,left:10,right:10}}>{geoMsg}</div>}
    </div>
  )
}

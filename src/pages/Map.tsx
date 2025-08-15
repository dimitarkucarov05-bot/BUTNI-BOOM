
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

export default function MapPage() {
  const [items, setItems] = useState<Code[]>([])
  const [now, setNow] = useState<Date>(new Date())

  useEffect(()=>{ const t = setInterval(()=>setNow(new Date()), 1000); return ()=>clearInterval(t) },[])

  const load = async () => {
    const { data } = await supabase.from('qr_codes').select('id,name,lat,lng,activation_time,is_active').order('name')
    setItems(data || [])
  }
  useEffect(()=>{ load() }, [])

  return (
    <MapContainer center={[43.2141,27.9147]} zoom={12} scrollWheelZoom={true} style={{height:'calc(100vh - 56px)'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {items.map(x=>{
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
    </MapContainer>
  )
}

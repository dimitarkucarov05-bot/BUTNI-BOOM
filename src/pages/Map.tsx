import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
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

// България (резервен център)
const BG_CENTER: [number, number] = [42.7339, 25.4858]
const TARGET_ZOOM = 16 // улично ниво

export default function MapPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [now, setNow] = useState<Date>(new Date())
  const [myPos, setMyPos] = useState<[number, number] | null>(null)
  const [geoMsg, setGeoMsg] = useState<string>('Зареждам GPS… позволи достъп до локацията.')

  // тикер за обратните броячи
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // зареждане на QR локациите
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('qr_codes')
        .select('id,name,lat,lng,activation_time,is_active')
        .order('name')
      setCodes(data || [])
    })()
  }, [])

  // вземи позицията → после стартирай картата точно върху мен
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoMsg('Устройството няма геолокация.')
      return
    }

    // първо – еднократен бърз фикс
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos([pos.coords.latitude, pos.coords.longitude])
        setGeoMsg('')
      },
      (err) => setGeoMsg(err.message || 'Грешка при геолокация.'),
      { enableHighAccuracy: true, timeout: 15000 }
    )

    // после – жива актуализация (без да прецентрираме картата)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setMyPos([pos.coords.latitude, pos.coords.longitude])
        setGeoMsg('')
      },
      (err) => setGeoMsg(err.message || 'Грешка при геолокация.'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [])

  // 1) Ако още нямаме позиция – покажи инфо, не рендвай картата
  if (!myPos) {
    return (
      <div className="container">
        <div className="alert">{geoMsg}</div>
        {/* Пада резервен изглед, ако потребителят отказва локация: */}
        <div style={{height:'50vh', marginTop:12}}>
          <MapContainer center={BG_CENTER as any} zoom={7} scrollWheelZoom={false} style={{height:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>
      </div>
    )
  }

  // 2) Когато имаме позиция – рендни картата директно върху мен с zoom 16
  return (
    <div style={{ position:'relative' }}>
      <MapContainer
        center={myPos as any}
        zoom={TARGET_ZOOM}
        minZoom={6}
        scrollWheelZoom={true}
        style={{height:'calc(100vh - 56px)'}}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* QR маркери */}
        {codes.map(x=>{
          const active = x.is_active || (!!x.activation_time && dayjs(x.activation_time).isBefore(dayjs()))
          const diff = x.activation_time ? dayjs(x.activation_time).diff(dayjs(now)) : 0
          const d = dayjs.duration(diff)
          return (
            <Marker key={x.id} position={[x.lat, x.lng]} icon={markerIcon}>
              <Popup>
                <div>
                  <b>{x.name}</b><br/>
                  {active ? <span className="badge">Активен</span> :
                    x.activation_time ? (
                      <span>Старт след: {d.asMilliseconds()>0 ? `${d.hours()}ч ${d.minutes()}м ${d.seconds()}с` : 'скоро…'}</span>
                    ) : (
                      <span>Очаква активация</span>
                    )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Само малкото синьо кръгче – без големия кръг на точността */}
        <CircleMarker
          center={myPos}
          radius={8}
          pathOptions={{ color:'#2563eb', fillColor:'#3b82f6', fillOpacity:1 }}
        />
      </MapContainer>
    </div>
  )
}


import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Auth from './pages/Auth'
import MapPage from './pages/Map'
import ScanPage from './pages/Scan'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <App/>, children: [
    { index: true, element: <MapPage/> },
    { path: 'scan', element: <ScanPage/> },
    { path: 'profile', element: <Profile/> },
    { path: 'auth', element: <Auth/> },
    { path: 'admin', element: <Admin/> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

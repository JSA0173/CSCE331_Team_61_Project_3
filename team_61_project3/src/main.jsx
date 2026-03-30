import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './views/PortalPage.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
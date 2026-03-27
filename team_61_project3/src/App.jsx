import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import PortalPage from './views/PortalPage'
import Kiosk from './views/Kiosk'
import Menu from './views/Menu'
import CashierPortal from './views/CashierPortal'
import ManagerPortal from './views/ManagerPortal'
/*imports for each view */


function App() {
  const [view, setView] = useState('portal');
  
  return (
    <div>

      {view === 'portal' && <PortalPage setView={setView}/>}
      {view === 'kiosk' && <Kiosk setView = {setView}/>}
      {view === 'manager' && <ManagerPortal setView = {setView}/>}
      {view === 'cashier' && <CashierPortal setView = {setView}/>}
      {view === 'menu' && <Menu setView = {setView}/>}
    </div>
  )
}

export default App

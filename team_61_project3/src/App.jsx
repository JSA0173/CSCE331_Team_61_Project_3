import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import PortalPage from './views/PortalPage'
import Kiosk from './views/KioskMainPage'
import Menu from './views/Menu'
import CashierPortal from './views/CashierPortal'
import ManagerPortal from './views/ManagerPortal'
import LoginCashier from './views/LoginCashier'
import LoginManager from './views/LoginManager'

import Employee from './views/Employee'
import Price from './views/Price'
import Report from './views/Reports'
import Inventory from './views/Inventory'
import GoogleTranslate from './views/GoogleTranslate'
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
      {view === 'employee' && <Employee setView = {setView} />}
      {view === 'price' && <Price setView = {setView} />}
      {view === 'report' && <Report setView = {setView} />}
      {view === 'inventory' && <Inventory setView = {setView} />}
      {view === 'loginManager' && <LoginManager setView = {setView} />}
      {view === 'loginCashier' && <LoginCashier setView = {setView} />}
      <GoogleTranslate/>
    </div>
  )
}

export default App

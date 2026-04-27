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
import ScreenMagnifier from "./views/ScreenMagnifier";
import { KeyboardProvider } from './views/Touchkeyboard';

function App() {
  const [view, setView] = useState('portal');
  const [profile, setProfile] = useState(null); 

  return (
    <div>
      <ScreenMagnifier zoom={2.5} lensSize={160}>
        <KeyboardProvider>
        {view === 'portal'       && <PortalPage setView={setView} />}
        {view === 'kiosk'        && <Kiosk setView={setView} />}
        {view === 'manager'      && <ManagerPortal setView={setView} profile={profile} />}  
        {view === 'cashier'      && <CashierPortal setView={setView} profile={profile} />}
        {view === 'menu'         && <Menu setView={setView} profile={profile} />}
        {view === 'employee'     && <Employee setView={setView} profile={profile} />}        
        {view === 'price'        && <Price setView={setView} profile={profile} />}           
        {view === 'report'       && <Report setView={setView} profile={profile} />}          
        {view === 'inventory'    && <Inventory setView={setView} profile={profile} />}       
        {view === 'loginManager' && <LoginManager setView={setView} setProfile={setProfile} />}
        {view === 'loginCashier' && <LoginCashier setView={setView} />}
        <GoogleTranslate />
        </KeyboardProvider>
      </ScreenMagnifier>
    </div>
  );
}

export default App;
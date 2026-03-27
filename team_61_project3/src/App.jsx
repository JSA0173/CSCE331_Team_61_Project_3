import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import PortalPage from './views/PortalPage'

/*imports for each view */


function App() {
  const [view, setView] = useState('portal');

  return (
    <div>
      {view === 'portal' && <PortalPage />}
    </div>
  )
}

export default App

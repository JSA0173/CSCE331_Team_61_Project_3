
function PortalPage( {setView}) {
  return (
    <div class = 'text'>
      <h1>Home</h1>
      <h2>Select the desired portal using the buttons below:</h2>
      <div class = 'buttons'>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Manager Portal</button>
        <button class = 'button' id = 'cashierbtn' onClick={() => setView('cashier')}> Cashier Portal</button>
        <button class = 'button' id = 'menubtn' onClick={() => setView('menu')}> Display Menu</button>
        <button class = 'button'id = 'kioskbtn' onClick={() => setView('kiosk')}> Customer Kiosk Portal</button>
      </div>
    </div>
  );
}

export default PortalPage;


function PortalPage() {
  return (
    <div class = 'text'>
      <h1>Home</h1>
      <h2>Select the desired portal using the buttons below:</h2>
      <div class = 'buttons'>
        <button class = 'button' id = 'managerbtn'> Manager Portal</button>
        <button class = 'button' id = 'cashierbtn'> Cashier Portal</button>
        <button class = 'button' id = 'menubtn'> Display Menu</button>
        <button class = 'button'id = 'kioskbtn'> Customer Kiosk Portal</button>
      </div>
    </div>
  );
}

export default PortalPage;
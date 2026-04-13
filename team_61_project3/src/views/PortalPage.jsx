import './PortalPage.css';
import GoogleTranslate from  './GoogleTranslate.jsx'



function PortalPage( {setView}) {
  const handleCashierClick = () => {
    const enteredPin = prompt("Enter cashier PIN:");

    if (!enteredPin) return;

    const correctPin = import.meta.env.VITE_CASHIER_PASSWORD;

    if (enteredPin === correctPin) {
      setView('cashier');
    } else {
      alert("Incorrect PIN");
    }
  };
  return (
    <div class = 'text'>
      <h1>Boba Shop Home</h1>
      <h2>Select the desired portal using the buttons below:</h2>
      <div class = 'buttons'>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Manager Portal</button>
        <button class = 'button' id = 'cashierbtn' onClick={handleCashierClick}> Cashier Portal</button>
        <button class = 'button' id = 'menubtn' onClick={() => setView('menu')}> Display Menu</button>
        <button class = 'button'id = 'kioskbtn' onClick={() => setView('kiosk')}> Customer Kiosk Portal</button>
      </div>
      
    </div>
  );
}

export default PortalPage;
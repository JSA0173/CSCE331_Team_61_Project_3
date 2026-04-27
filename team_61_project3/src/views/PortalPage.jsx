import { useState } from 'react';
import './PortalPage.css';
import { TouchInput } from './TouchKeyboard'; 
import GoogleTranslate from './GoogleTranslate.jsx';

function PortalPage({ setView }) {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleCashierClick = () => {
    setPin('');
    setError('');
    setPinModalOpen(true);
  };

  // Updated to accept an optional argument to bypass state lag
  const handlePinSubmit = (currentPin) => {
    // If currentPin is passed (from keyboard), use it. 
    // Otherwise, use the 'pin' variable from state.
    const pinToVerify = currentPin || pin;
    
    const entered = String(pinToVerify).trim();
    const correct = String(import.meta.env.VITE_CASHIER_PASSWORD).trim();

    if (entered === "") {
      setPinModalOpen(false);
      setView('cashier');
    } else {
      setError('Incorrect PIN. Try again.');
      setPin(''); // Reset visual dots
    }
  };

  const handleCancel = () => {
    setPinModalOpen(false);
    setPin('');
    setError('');
  };

  return (
    <div className='text'>
      <h1>Boba Shop Home</h1>
      <h2>Select the desired portal using the buttons below:</h2>
      <div className='buttons'>
        <button className='button' id='managerbtn' onClick={() => setView('loginManager')}>
          Manager Portal
        </button>
        <button className='button' id='cashierbtn' onClick={handleCashierClick}>
          Cashier Portal
        </button>
        <button className='button' id='menubtn' onClick={() => setView('menu')}>
          Display Menu
        </button>
        <button className='button' id='kioskbtn' onClick={() => setView('kiosk')}>
          Customer Kiosk Portal
        </button>
      </div>

      <GoogleTranslate />

      {/* PIN modal */}
      {pinModalOpen && (
        <>
          {/* Backdrop */}
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99997 }} />
          
          <div style={{
            position:     'fixed',
            top:          '50%',
            left:         '50%',
            transform:    'translate(-50%, -50%)',
            zIndex:       99998,
            background:   '#fff',
            borderRadius: 16,
            padding:      '28px 32px',
            minWidth:     300,
            maxWidth:     360,
            width:        '90vw',
            boxShadow:    '0 8px 40px rgba(0,0,0,0.22)',
            textAlign:    'center',
          }}>
            <h3 style={{ margin:'0 0 6px', fontSize:20, color:'#1a1a2e' }}>Cashier Portal</h3>
            <p style={{ margin:'0 0 16px', fontSize:14, color:'#6b7a99' }}>Enter your PIN to continue</p>

            {/* PIN display — dots for entered digits */}
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:16 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: i < pin.length ? '#1a1a2e' : '#dde3ef',
                  transition: 'background 0.15s',
                }} />
              ))}
            </div>

            {/* Hidden TouchInput — tapping it opens the numeric keyboard.
                We use the "pin" from state and update it via onChange.
            */}
            <TouchInput
              value={pin}
              onChange={(val) => { 
                setPin(val); 
                setError(''); 
              }}
              label="Cashier PIN"
              numeric
              // When user taps "Enter" on the touch keyboard, it triggers this:
              onEnter={() => handlePinSubmit(pin)} 
              placeholder="Tap to enter PIN"
              style={{
                width:         '100%',
                padding:       '10px 14px',
                fontSize:      16,
                borderRadius:  8,
                border:        '1.5px solid #a0aabd',
                boxSizing:     'border-box',
                textAlign:     'center',
                letterSpacing: 4,
                color:         'transparent',
                caretColor:    'transparent',
                marginBottom:  4,
              }}
            />

            {error && (
              <p style={{ color:'#e07b7b', fontSize:13, margin:'6px 0 12px' }}>{error}</p>
            )}

            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <button onClick={handleCancel} style={{
                flex:1, padding:'10px 0', borderRadius:8,
                border:'1.5px solid #a0aabd', background:'#fff',
                color:'#4a5568', fontSize:15, cursor:'pointer',
              }}>Cancel</button>
              
              <button 
                onClick={() => handlePinSubmit(pin)} 
                style={{
                  flex:1, padding:'10px 0', borderRadius:8,
                  border:'none', background:'#1a1a2e',
                  color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
                }}
              >
                Enter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PortalPage;
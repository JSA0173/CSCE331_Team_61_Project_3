import { useState, useEffect } from 'react';
import './KioskMainPage.css';
import './KioskMainPageAlt.css';
import MenuPage from './MenuKioskPage';
import CustomItemPage from './CustomItemPage';
import { TouchInput } from './Touchkeyboard';

function KioskMainPage({ setView }) {
    const [kioskView, setKioskView] = useState('home');
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [weather, setWeather] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [altTheme, setAltTheme] = useState(false);

    // TTS State
    const [ttsEnabled, setTtsEnabled] = useState(false);

    // Chatbot state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: 'Hi! I can help you with the menu or ordering. What would you like to know?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Rewards/phone modal state (replaces prompt())
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pointsInput, setPointsInput] = useState('');
    const [rewardsStep, setRewardsStep] = useState(null); // null | 'phone' | 'points'
    const [availablePoints, setAvailablePoints] = useState(0);
    const [pendingOrderCb, setPendingOrderCb] = useState(null);

    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.3344&current=temperature_2m,weather_code&temperature_unit=fahrenheit')
            .then(res => res.json())
            .then(data => setWeather(data.current))
            .catch(err => console.error('Failed to load weather:', err));

        fetch('/api/items/menu')
            .then(res => res.json())
            .then(data => setMenuItems(data))
            .catch(err => console.error('Failed to load menu:', err));
    }, []);

    const weatherDescription = (code) => {
        if (code === 0) return 'Clear ☀️';
        if (code <= 3) return 'Partly Cloudy ⛅';
        if (code <= 48) return 'Foggy 🌫️';
        if (code <= 67) return 'Rainy 🌧️';
        if (code <= 77) return 'Snowy ❄️';
        if (code <= 82) return 'Showers 🌦️';
        if (code <= 86) return 'Snow Showers 🌨️';
        return 'Thunderstorm ⛈️';
    };

    function speak(text, force = false) {
        if (!ttsEnabled && !force) return;
        window.speechSynthesis.cancel();
        const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        window.speechSynthesis.speak(utterance);
    }

    async function sendChatMessage() {
        if (!chatInput.trim() || chatLoading) return;
        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setChatLoading(true);
        try {
            const menuContext = menuItems.map(i => `${i.name} ($${i.basePrice})`).join(', ');
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, menuContext })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Chat failed');
            setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I had trouble responding: ' + err.message }]);
        } finally {
            setChatLoading(false);
        }
    }

    function clearCart() {
        setCart([]);
        setCartTotal(0);
        setCustomerName('');
    }    

    function addToCart(lineItem) {
        setCart(prev => {
            // Check if identical item already exists (same drink, size, base, ice, temp, sugar)
            const existingIndex = prev.findIndex(li =>
                li.drinkName === lineItem.drinkName &&
                li.size === lineItem.size &&
                li.baseType === lineItem.baseType &&
                li.iceLevel === lineItem.iceLevel &&
                li.temperature === lineItem.temperature &&
                li.sugarAmount === lineItem.sugarAmount
            );
    
            if (existingIndex !== -1) {
                // Increment quantity on existing item
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: (updated[existingIndex].quantity || 1) + 1
                };
                return updated;
            }
    
            // New item — add with quantity 1
            return [...prev, { ...lineItem, quantity: 1 }];
        });
        setCartTotal(prev => prev + lineItem.price);
        speak(`${lineItem.drinkName} added to cart`);
    }
    
    function updateQuantity(index, delta) {
        setCart(prev => {
            const updated = [...prev];
            const item = updated[index];
            const newQty = (item.quantity || 1) + delta;
    
            if (newQty < 1) return prev; // minimum of 1
    
            setCartTotal(tot => tot + (item.price * delta));
            updated[index] = { ...item, quantity: newQty };
            return updated;
        });
    }
    
    function removeFromCart(index) {
        setCart(prev => {
            const item = prev[index];
            setCartTotal(tot => tot - item.price * (item.quantity || 1));
            return prev.filter((_, i) => i !== index);
        });
        speak('Item removed from cart');
    }

    // Replaces the prompt()-based flow with touch-friendly modals
    async function submitOrder() {
        if (cart.length === 0) {
            alert('Add at least one drink first.');
            speak('Add at least one drink first.');
            return;
        }
        // Start the rewards flow — open phone number modal
        setPhoneNumber('');
        setPointsInput('');
        setRewardsStep('phone');
    }

    async function handlePhoneDone() {
        // No phone entered — skip rewards entirely
        if (!phoneNumber.trim()) {
            setRewardsStep(null);
            await finalizeOrder(null, 0);
            return;
        }
        try {
            const res = await fetch('/api/rewards/getPoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });
            const data = await res.json();
            const pts = data.points ?? 0;
            if (pts > 0) {
                setAvailablePoints(pts);
                setPointsInput('0');
                setRewardsStep('points');
            } else {
                setRewardsStep(null);
                await finalizeOrder(phoneNumber, 0);
            }
        } catch {
            setRewardsStep(null);
            await finalizeOrder(phoneNumber, 0);
        }
    }

    async function handlePointsDone() {
        const pts = Math.max(0, Math.min(Number(pointsInput) || 0, availablePoints));
        setRewardsStep(null);
        await finalizeOrder(phoneNumber, pts);
    }

    async function finalizeOrder(phone, pointsToSpend) {
        try {
            let addedPoints = Math.floor(cartTotal / 5);
            if (phone && pointsToSpend > 0) {
                addedPoints -= pointsToSpend;
                await fetch('/api/rewards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone, pointsToAdd: addedPoints })
                });
            } else if (phone) {
                await fetch('/api/rewards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone, pointsToAdd: addedPoints })
                });
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: customerName || 'ANONYMOUS',
                    totalAmount: cartTotal,
                    lineItems: cart
                })
            });
            const finalTotal = cartTotal - pointsToSpend * 0.20;
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Order failed');
            alert(`Order #${data.orderId} submitted!\nTotal: $${finalTotal.toFixed(2)}`);
            speak(`Order #${data.orderId} submitted! Total: $${finalTotal.toFixed(2)}`);
            clearCart();
        } catch (err) {
            alert('Order failed: ' + err.message);
            speak('Order failed: ' + err.message);
        }
    }

    if (kioskView === 'menu')
        return <MenuPage setView={setKioskView} addToCart={addToCart} ttsEnabled={ttsEnabled} speak={speak} altTheme={altTheme} />;  
    
    if (kioskView === 'custom')
        return <CustomItemPage setView={setKioskView} onAdd={addToCart} altTheme={altTheme} speak={speak} />;  

    return (
        <div className={altTheme ? "kiosk-main alt-theme" : "kiosk-main"}>  
            <div className="title-section">
                <h1>Kiosk</h1>
                {weather && (
                    <div className="weather-widget">
                        College Station: {Math.round(weather.temperature_2m)}°F · {weatherDescription(weather.weather_code)}
                    </div>
                )}
            </div>

            <div 
                className="menu-section" 
                onMouseEnter={() => speak('Order from menu')}
                onClick={() => setKioskView('menu')}
            >
                <h2>Order From Menu</h2>
            </div>

            <div 
                className="custom-item-section" 
                onMouseEnter={() => speak('Order custom item')}
                onClick={() => setKioskView('custom')}
            >
                <h2>Order Custom Item</h2>
            </div>

            <div className="cart-section">
                <h2>Cart</h2>
                <div 
                    style={{ marginBottom: '12px' }}
                    onMouseEnter={() => speak('Enter your name')}
                >
                    <label style={{ fontWeight: 600, marginRight: '8px' }}>Name:</label>
                    <TouchInput
                        value={customerName}
                        onChange={setCustomerName}
                        placeholder="Enter your name"
                        label="Your Name"
                        style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #c9d6e8',
                            fontSize: '14px',
                            width: '100%',
                            marginTop: '4px',
                        }}
                    />
                </div>
                {cart.length === 0 && <p>Cart is empty</p>}
                {cart.map((li, i) => (
                    <div key={i} className="cart-item">
                        <div className="cart-item-top">
                            <strong>{li.drinkName}</strong> ({li.size}) — ${(li.price * (li.quantity || 1)).toFixed(2)}
                            {/* ✅ Remove button */}
                            <button
                                className="cart-item-remove"
                                onClick={() => removeFromCart(i)}
                                onMouseEnter={() => speak('Remove item')}
                                aria-label="Remove item"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="cart-item-details">
                            {li.baseType} · {li.temperature} · Ice: {li.iceLevel} · Sugar: {li.sugarAmount}%
                        </div>
                        {/* ✅ Quantity controls */}
                        <div className="cart-item-qty">
                            <button
                                className="qty-btn"
                                onClick={() => updateQuantity(i, -1)}
                                onMouseEnter={() => speak('Decrease quantity')}
                                disabled={li.quantity <= 1}
                            >
                                −
                            </button>
                            <span className="qty-value">{li.quantity || 1}</span>
                            <button
                                className="qty-btn"
                                onClick={() => updateQuantity(i, 1)}
                                onMouseEnter={() => speak('Increase quantity')}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    className="submit-button"
                    onClick={submitOrder}
                    onMouseEnter={() => speak(`Submit order. Total: $${cartTotal.toFixed(2)}`)}
                >
                    Submit Order
                </button>
            </div>

            {/*text to speech button */}
            <button
                className={`tts-button ${ttsEnabled ? 'tts-on' : ''}`}
                onClick={() => {
                    const willBeEnabled = !ttsEnabled;
                    setTtsEnabled(willBeEnabled);
                    if (willBeEnabled) {
                        setTimeout(() => speak('Text to speech enabled', true), 300);
                    }
                }}
                aria-label={ttsEnabled ? 'Text to speech on' : 'Text to speech off'}
                aria-pressed={ttsEnabled}
            >
                🔊
            </button>

            {/* Theme toggle button */}
            <button
                className="theme-toggle-btn"
                onClick={() => setAltTheme(!altTheme)}
                aria-label="Toggle theme"
            >
                {altTheme ? '☀️' : '🌙'}
            </button>

            {/* Chatbot toggle */}
            <button className="chat-toggle-button" onClick={() => setChatOpen(!chatOpen)} aria-label="Open chat assistant" aria-expanded={chatOpen}>
                AI
            </button>

            {/* Chatbot Panel */}
            {chatOpen && (
                <div className="chat-panel" role="dialog" aria-label="Boba Assistant chat">
                    <div className="chat-header">
                        <span>Boba Assistant</span>
                        <button className="chat-close-button" onClick={() => setChatOpen(false)} aria-label="Close chat">×</button>
                    </div>
                    <div className="chat-messages" aria-live="polite" aria-label="Chat messages">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {chatLoading && <div className="chat-thinking">Thinking...</div>}
                    </div>
                    <div className="chat-input-row">
                        <TouchInput
                            value={chatInput}
                            onChange={setChatInput}
                            placeholder="Ask me anything..."
                            label="Chat"
                            onEnter={sendChatMessage}
                            className="chat-input"
                            aria-label="Chat message input"
                        />
                        <button className="chat-send-button" onClick={sendChatMessage} disabled={chatLoading}>
                            Send
                        </button>
                    </div>
                </div>
            )}

            {/* ── Rewards: phone number modal ── */}
            {rewardsStep === 'phone' && (
                <RewardsModal title="Rewards Program" subtitle="Enter your phone number to earn & redeem points, or skip to continue.">
                    <TouchInput
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        placeholder="e.g. 5551234567"
                        label="Phone Number"
                        numeric
                        onEnter={handlePhoneDone}
                        style={modalInputStyle}
                    />
                    <div style={{ display:'flex', gap:12, marginTop:16 }}>
                        <button style={modalBtnSecondary} onClick={() => { setRewardsStep(null); finalizeOrder(null, 0); }}>Skip</button>
                        <button style={modalBtnPrimary} onClick={handlePhoneDone}>Continue</button>
                    </div>
                </RewardsModal>
            )}

            {/* ── Rewards: points modal ── */}
            {rewardsStep === 'points' && (
                <RewardsModal title="Redeem Points" subtitle={`You have ${availablePoints} points. Each point is worth $0.20. Enter how many to spend (or 0 to skip).`}>
                    <TouchInput
                        value={pointsInput}
                        onChange={setPointsInput}
                        placeholder="0"
                        label="Points to spend"
                        numeric
                        onEnter={handlePointsDone}
                        style={modalInputStyle}
                    />
                    <p style={{ fontSize:13, color:'#6b7a99', margin:'6px 0 0' }}>
                        Discount: ${(Math.min(Number(pointsInput)||0, availablePoints) * 0.20).toFixed(2)}
                    </p>
                    <div style={{ display:'flex', gap:12, marginTop:16 }}>
                        <button style={modalBtnSecondary} onClick={() => handlePointsDone()}>Use 0 Points</button>
                        <button style={modalBtnPrimary} onClick={handlePointsDone}>Confirm</button>
                    </div>
                </RewardsModal>
            )}
        </div>
    );
}

// ─── Rewards modal shell ──────────────────────────────────────────────────────
function RewardsModal({ title, subtitle, children }) {
    return (
        <>
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:99997 }} />
            <div style={{
                position:  'fixed',
                top:       '50%',
                left:      '50%',
                transform: 'translate(-50%, -50%)',
                zIndex:    99998,
                background:'#fff',
                borderRadius: 16,
                padding:   '28px 32px',
                minWidth:  320,
                maxWidth:  420,
                boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
                width:     '90vw',
            }}>
                <h3 style={{ margin:'0 0 6px', fontSize:20, color:'#1a1a2e' }}>{title}</h3>
                <p style={{ margin:'0 0 16px', fontSize:14, color:'#6b7a99' }}>{subtitle}</p>
                {children}
            </div>
        </>
    );
}

const modalInputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 16,
    borderRadius: 8,
    border: '1.5px solid #a0aabd',
    boxSizing: 'border-box',
};

const modalBtnPrimary = {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: '#4CAF50',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
};

const modalBtnSecondary = {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: '1.5px solid #a0aabd',
    background: '#fff',
    color: '#4a5568',
    fontSize: 15,
    cursor: 'pointer',
};

export default KioskMainPage;
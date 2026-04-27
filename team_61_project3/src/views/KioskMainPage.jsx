import { useState, useEffect } from 'react';
import './KioskMainPage.css';
import MenuPage from './MenuKioskPage';
import CustomItemPage from './CustomItemPage';

function KioskMainPage({ setView }) {
    const [kioskView, setKioskView] = useState('home');
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [weather, setWeather] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    // TTS State
    const [ttsEnabled, setTtsEnabled] = useState(false);

    // Chatbot state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: 'Hi! I can help you with the menu or ordering. What would you like to know?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

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

    function addToCart(lineItem) {
        setCart(prev => [...prev, lineItem]);
        setCartTotal(prev => prev + lineItem.price);
        speak(`${lineItem.drinkName} added to cart`);
    }

    function clearCart() {
        setCart([]);
        setCartTotal(0);
        setCustomerName('');
    }

    async function submitOrder() {
        if (cart.length === 0) {
            alert('Add at least one drink first.');
            speak(`Add at least one drink first.`);
            return;
        }
        try {
            const phoneNumber = prompt("Enter phone number for rewards:");
            let pointsToSpend = 0;
            if (phoneNumber) {
                const pointsRes = await fetch('/api/rewards/getPoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber })
                });
                
                const dataPoints = await pointsRes.json();
                const points = dataPoints.points;

                let addedPoints = Math.floor(cartTotal / 5);


                if (points > 0) {
                    pointsToSpend = prompt(`You have ${points} points. How many points would you like to spend? (Each point is worth $0.20)`);

                    while (
                        pointsToSpend === null ||
                        isNaN(pointsToSpend) ||
                        !Number.isInteger(Number(pointsToSpend)) ||
                        Number(pointsToSpend) < 0 ||
                        Number(pointsToSpend) > points
                    ) {
                        alert("Invalid number of points. Please re-enter");

                        pointsToSpend = prompt(`You have ${points} points. How many points would you like to spend? (Each point is worth $0.20)`);
                    }

                    pointsToSpend = Number(pointsToSpend);
                    addedPoints -= pointsToSpend;
                }

                const rewardRes = await fetch('/api/rewards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        phoneNumber: phoneNumber,
                        pointsToAdd: addedPoints
                    })
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
            speak(`Order #${data.orderId} submitted!\nTotal: $${finalTotal.toFixed(2)}`);
            clearCart();
        } catch (err) {
            alert('Order failed: ' + err.message);
            speak('Order failed: ' + err.message);
        }
    }

    if (kioskView === 'menu')
        return <MenuPage setView={setKioskView} addToCart={addToCart} ttsEnabled={ttsEnabled} speak={speak} />;

    if (kioskView === 'custom')
        return <CustomItemPage setView={setKioskView} onAdd={addToCart} />;

    return (
        <div className="kiosk-main">

            <div className="title-section">
                <h1>Kiosk</h1>
                {weather && (
                    <div className="weather-widget">
                        College Station: {Math.round(weather.temperature_2m)}°F · {weatherDescription(weather.weather_code)}
                    </div>
                )}
            </div>

            <div className="menu-section" onClick={() => setKioskView('menu')}>
                <h2>Order From Menu</h2>
            </div>

            <div className="custom-item-section" onClick={() => setKioskView('custom')}>
                <h2>Order Custom Item</h2>
            </div>

            <div className="cart-section">
                <h2>Cart</h2>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 600, marginRight: '8px' }}>Name:</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #c9d6e8',
                            fontSize: '14px',
                            width: '100%',
                            marginTop: '4px'
                        }}
                    />
                </div>

                {cart.length === 0 && <p>Cart is empty</p>}
                {cart.map((li, i) => (
                    <div key={i} className="cart-item">
                        <strong>{li.drinkName}</strong> ({li.size}) — ${li.price.toFixed(2)}
                        <div className="cart-item-details">
                            {li.baseType} · {li.temperature} · Ice: {li.iceLevel} · Sugar: {li.sugarAmount}%
                        </div>
                    </div>
                ))}
                <div className="cart-total">Total: ${cartTotal.toFixed(2)}</div>
                <button className="submit-button" onClick={submitOrder}>Submit Order</button>
            </div>

            {/*text to speech button */}
            <button
                className={`tts-button ${ttsEnabled ? 'tts-on' : ''}`}
                onClick={() => {
                    const willBeEnabled = !ttsEnabled;
                    setTtsEnabled(willBeEnabled);

                    if (willBeEnabled) {
                        setTimeout(() => {
                            speak('Text to speech enabled', true);
                        }, 300);
                    }
                }}
                aria-label={ttsEnabled ? 'Text to speech on' : 'Text to speech off'}
                aria-pressed={ttsEnabled}
            >
                🔊
            </button>

            {/* Chatbot Toggle Button */}
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
                        <input
                            type="text"
                            className="chat-input"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
                            placeholder="Ask me anything..."
                            aria-label="Chat message input"
                        />
                        <button className="chat-send-button" onClick={sendChatMessage} disabled={chatLoading}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KioskMainPage;
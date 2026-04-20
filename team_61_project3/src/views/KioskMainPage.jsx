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
    }

    function clearCart() {
        setCart([]);
        setCartTotal(0);
        setCustomerName('');
    }

    async function submitOrder() {
        if (cart.length === 0) {
            alert('Add at least one drink first.');
            return;
        }
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: customerName || 'ANONYMOUS',
                    totalAmount: cartTotal,
                    lineItems: cart
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Order failed');
            alert(`Order #${data.orderId} submitted!\nTotal: $${cartTotal.toFixed(2)}`);
            clearCart();
        } catch (err) {
            alert('Order failed: ' + err.message);
        }
    }

    if (kioskView === 'menu')
        return <MenuPage setView={setKioskView} addToCart={addToCart} />;

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

            {/* Chatbot Toggle Button */}
            <button
                onClick={() => setChatOpen(!chatOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#e53935',
                    color: '#fff',
                    fontSize: '24px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000
                }}
            >
                AI
            </button>

            {/* Chatbot Panel */}
            {chatOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                    width: '340px',
                    height: '450px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000
                }}>
                    <div style={{
                        padding: '12px 16px',
                        background: '#e53935',
                        color: '#fff',
                        borderRadius: '12px 12px 0 0',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Boba Assistant</span>
                        <button
                            onClick={() => setChatOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '0 4px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{
                        flex: 1,
                        padding: '12px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {chatMessages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.role === 'user' ? '#e53935' : '#f1f1f1',
                                color: msg.role === 'user' ? '#fff' : '#000',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                maxWidth: '80%',
                                fontSize: '14px'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {chatLoading && <div style={{ color: '#888', fontSize: '13px' }}>Thinking...</div>}
                    </div>
                    <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '6px' }}>
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={sendChatMessage}
                            disabled={chatLoading}
                            style={{
                                background: '#e53935',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KioskMainPage;
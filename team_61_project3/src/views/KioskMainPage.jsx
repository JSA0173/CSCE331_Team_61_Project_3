import { useState } from 'react';
import './KioskMainPage.css';
import MenuPage from './MenuKioskPage';
import CustomItemPage from './CustomItemPage';

function KioskMainPage({ setView }) {
    const [kioskView, setKioskView] = useState('home');
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');

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
            </div>

            <div className="menu-section" onClick={() => setKioskView('menu')}>
                <h2>Menu</h2>
            </div>

            <div className="custom-item-section" onClick={() => setKioskView('custom')}>
                <h2>Custom Item</h2>
            </div>

            <div className="cart-section">
                <h2>Cart</h2>

                {/* Customer name input lives here */}
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
        </div>
    );
}

export default KioskMainPage;
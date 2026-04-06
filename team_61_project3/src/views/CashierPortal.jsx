import { useState, useEffect } from 'react';
import ToggleMenu from './ToggleMenu';

function CashierPortal({ setView }) {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetch('/api/items/menu')
            .then(res => res.json())
            .then(data => setMenuItems(data))
            .catch(err => console.error('Failed to load menu:', err));
    }, []);

    function addToCart(lineItem) {
        setCart([...cart, lineItem]);
        setCartTotal(cartTotal + lineItem.price);
        setSelectedItem(null);
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
            setCart([]);
            setCartTotal(0);
            setCustomerName('');
        } catch (err) {
            alert('Order failed: ' + err.message);
        }
    }

    if (selectedItem) {
        return (
            <ToggleMenu
                item={selectedItem}
                customerName={customerName}
                setCustomerName={setCustomerName}
                onAdd={addToCart}
                onBack={() => setSelectedItem(null)}
            />
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Cashier Portal</h1>
            <button className="button" onClick={() => setView('manager')}>
                Return to Manager Portal
            </button>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {/* Menu Grid */}
                <div style={{ flex: 1 }}>
                    <h2>Menu</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {menuItems.map(item => (
                            <button
                                key={item.itemId}
                                onClick={() => setSelectedItem(item)}
                                style={{
                                    width: '150px',
                                    height: '80px',
                                    padding: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {item.name}<br />
                                ${parseFloat(item.basePrice).toFixed(2)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart Panel */}
                <div style={{ width: '320px', border: '1px solid #ccc', padding: '16px' }}>
                    <h2>Cart</h2>
                    {cart.length === 0 && <p>Cart is empty</p>}
                    {cart.map((li, i) => (
                        <div key={i} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                            <strong>{li.drinkName}</strong> ({li.size}) - ${li.price.toFixed(2)}
                            <div style={{ fontSize: '11px', color: '#666' }}>
                                {li.baseType} · {li.temperature} · Ice: {li.iceLevel} · Sugar: {li.sugarAmount}%
                            </div>
                        </div>
                    ))}
                    <div style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '18px' }}>
                        Total: ${cartTotal.toFixed(2)}
                    </div>
                    <button
                        onClick={submitOrder}
                        style={{ width: '100%', marginTop: '12px', padding: '10px' }}
                    >
                        Submit Order
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CashierPortal;
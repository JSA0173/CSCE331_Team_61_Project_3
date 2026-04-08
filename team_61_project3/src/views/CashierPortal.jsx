import { useState, useEffect } from 'react';
import './CashierPortal.css'
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
        <div className="cashier-portal">
            <h1>Cashier Portal</h1>

            <div className="portal-layout">
                <div className="menu-section">
                    <h2>Menu</h2>
                    <div className="menu-grid">
                        {menuItems.map(item => (
                            <button
                                key={item.itemId}
                                className="menu-item-button"
                                onClick={() => setSelectedItem(item)}
                            >
                                {item.name}<br />
                                ${parseFloat(item.basePrice).toFixed(2)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="cart-panel">
                    <h2>Cart</h2>
                    {cart.length === 0 && <p>Cart is empty</p>}
                    {cart.map((li, i) => (
                        <div key={i} className="cart-item">
                            <strong>{li.drinkName}</strong> ({li.size}) - ${li.price.toFixed(2)}
                            <div className="cart-item-details">
                                {li.baseType} · {li.temperature} · Ice: {li.iceLevel} · Sugar: {li.sugarAmount}%
                            </div>
                        </div>
                    ))}
                    <div className="cart-total">
                        Total: ${cartTotal.toFixed(2)}
                    </div>
                    <button className="submit-button" onClick={submitOrder}>
                        Submit Order
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CashierPortal;
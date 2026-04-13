import { useState, useEffect } from 'react';
import './MenuKioskPage.css';
import ToggleKioskMenu from './ToggleKioskMenu';

function MenuKioskPage({ setView, addToCart }) {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetch('/api/items/menu')
            .then(res => res.json())
            .then(data => setMenuItems(data))
            .catch(err => console.error('Failed to load menu:', err));
    }, []);

    function handleAdd(lineItem) {
        addToCart(lineItem);
        setView('home');
        setSelectedItem(null);
    }

    if (selectedItem) {
        return (
            <ToggleKioskMenu
                item={selectedItem}
                onAdd={handleAdd}
                onBack={() => setSelectedItem(null)}
            />
        );
    }

    return (
        <div className="cashier-portal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <button className="btn-back" onClick={() => setView('home')}>← Back</button>
                <h1>Menu</h1>
            </div>

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
    );
}

export default MenuKioskPage;
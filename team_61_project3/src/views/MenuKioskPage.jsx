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
        <div className="kiosk-toggle-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <button className="btn-back" onClick={() => setView('home')}>← Back</button>
                <h1 style={{ color: '#002147', fontSize: '40px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' }}>Menu</h1>
            </div>

            <div className="menu-grid">
                {menuItems.map(item => (
                    <button
                        key={item.itemId}
                        className="option-item"
                        style={{ cursor: 'pointer', background: 'none', border: 'none', justifyContent: 'space-between' }}
                        onClick={() => setSelectedItem(item)}
                    >
                        <span>{item.name}</span>
                        <span>${parseFloat(item.basePrice).toFixed(2)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default MenuKioskPage;
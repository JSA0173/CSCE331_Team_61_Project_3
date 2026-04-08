import { useState, useEffect } from 'react';
import './Price.css';

function Price({ setView }) {
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    function loadItems() {
        fetch('/api/items')
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error(err));
    }

    useEffect(() => {
        loadItems();
    }, []);

    async function addItem() {
        const name = prompt('Item Name:');
        if (!name) return;
        const basePrice = prompt('Base Price:');
        if (!basePrice) return;
        const size = prompt('Size (Normal or Large):', 'Normal');
        if (!size) return;

        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    basePrice: parseFloat(basePrice),
                    size
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Item added!');
            loadItems();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function updatePrice() {
        const id = prompt('Item ID to update:');
        if (!id) return;
        const basePrice = prompt('New Price:');
        if (!basePrice) return;

        try {
            const res = await fetch(`/api/items/${id}/price`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ basePrice: parseFloat(basePrice) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Price updated!');
            loadItems();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function toggleEnabled() {
        if (!selectedId) {
            alert('Click a row first, then press Toggle.');
            return;
        }
        try {
            const res = await fetch(`/api/items/${selectedId}/toggle`, { method: 'PUT' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(`${data.name} is now ${data.enabled ? 'ENABLED' : 'DISABLED'}`);
            loadItems();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    return (
        <>
            <h1>Prices</h1>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th className='tableheader'>ID</th>
                        <th className='tableheader'>Name</th>
                        <th className='tableheader'>Price</th>
                        <th className='tableheader'>Size</th>
                        <th className='tableheader'>Enabled</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr
                            key={item.itemId}
                            onClick={() => setSelectedId(item.itemId)}
                            style={{
                                cursor: 'pointer',
                                background: selectedId === item.itemId ? '#ffe0e0' : 'transparent'
                            }}
                        >
                            <td className='odd'>{item.itemId}</td>
                            <td className='even'>{item.name}</td>
                            <td className='odd'>${parseFloat(item.basePrice).toFixed(2)}</td>
                            <td className='even'>{item.size}</td>
                            <td className='odd'>{item.enabled ? 'yes' : 'no'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className='employeebutton' onClick={() => setView('manager')}>Return to Manager Portal Home</button>
            <button className='employeebutton' onClick={addItem}>Add Item</button>
            <button className='employeebutton' onClick={updatePrice}>Update Price</button>
            <button className='employeebutton' onClick={toggleEnabled}>Toggle Enabled</button>
        </>
    );
}

export default Price;
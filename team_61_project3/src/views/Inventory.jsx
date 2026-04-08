import { useState, useEffect } from 'react';
import './Inventory.css'

function Inventory({ setView }) {
    const [inventory, setInventory] = useState([]);

    function loadInventory() {
        fetch('/api/inventory')
            .then(res => res.json())
            .then(data => setInventory(data))
            .catch(err => console.error(err));
    }

    useEffect(() => {
        loadInventory();
    }, []);

    async function addItem() {
        const name = prompt('Item Name:');
        if (!name) return;
        const quantityOnHand = prompt('Quantity On Hand:');
        if (!quantityOnHand) return;
        const pricePerUnit = prompt('Price Per Unit:');
        if (!pricePerUnit) return;
        const reorderThreshold = prompt('Reorder Threshold:');
        if (!reorderThreshold) return;
        const type = prompt('Type (Base, Flavor, Topping, Other):');
        if (!type) return;

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    quantityOnHand: parseFloat(quantityOnHand),
                    pricePerUnit: parseFloat(pricePerUnit),
                    reorderThreshold: parseInt(reorderThreshold),
                    type
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Inventory item added!');
            loadInventory();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function updateItem() {
        const id = prompt('Inventory ID to update:');
        if (!id) return;
        const quantityOnHand = prompt('New Quantity:');
        if (!quantityOnHand) return;
        const pricePerUnit = prompt('New Price Per Unit:');
        if (!pricePerUnit) return;
        const reorderThreshold = prompt('New Reorder Threshold:');
        if (!reorderThreshold) return;

        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantityOnHand: parseFloat(quantityOnHand),
                    pricePerUnit: parseFloat(pricePerUnit),
                    reorderThreshold: parseInt(reorderThreshold)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Inventory item updated!');
            loadInventory();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    return (
        <>
            <h1>Inventory</h1>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th className='tableheader'>ID</th>
                        <th className='tableheader'>Name</th>
                        <th className='tableheader'>Quantity</th>
                        <th className='tableheader'>Price/Unit</th>
                        <th className='tableheader'>Reorder At</th>
                        <th className='tableheader'>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map(item => (
                        <tr key={item.inventoryId}>
                            <td className='odd'>{item.inventoryId}</td>
                            <td className='even'>{item.name}</td>
                            <td className='odd'>{item.quantityOnHand}</td>
                            <td className='even'>${parseFloat(item.pricePerUnit).toFixed(2)}</td>
                            <td className='odd'>{item.reorderThreshold}</td>
                            <td className='even'>{item.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className='employeebutton' id='managerbtn' onClick={() => setView('manager')}>
                Return to Manager Portal Home
            </button>
            <button className='employeebutton' onClick={addItem}>Add Item</button>
            <button className='employeebutton' onClick={updateItem}>Update Item</button>
        </>
    );
}

export default Inventory;
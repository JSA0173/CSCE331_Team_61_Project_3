import { useState, useEffect } from 'react';

function Inventory({ setView }) {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        fetch('/api/inventory')
            .then(res => res.json())
            .then(data => setInventory(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <h1>Inventory</h1>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price/Unit</th>
                        <th>Reorder At</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map(item => (
                        <tr key={item.inventoryId}>
                            <td>{item.inventoryId}</td>
                            <td>{item.name}</td>
                            <td>{item.quantityOnHand}</td>
                            <td>${parseFloat(item.pricePerUnit).toFixed(2)}</td>
                            <td>{item.reorderThreshold}</td>
                            <td>{item.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className='button' id='managerbtn' onClick={() => setView('manager')}>
                Return to Manager Portal Home
            </button>
        </>
    );
}

export default Inventory;
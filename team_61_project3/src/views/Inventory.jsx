import { useState, useEffect } from 'react';
import './Inventory.css'

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
            <button className='employeebutton'> Add Item</button>
            <button className='employeebutton'> Update Item</button>
        </>
    );
}

export default Inventory;
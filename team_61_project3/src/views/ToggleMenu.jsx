import { useState, useEffect } from 'react';
import './ToggleMenu.css'; // Import the new CSS file

function ToggleMenu({ item, customerName, setCustomerName, onAdd, onBack }) {
    const [bases, setBases] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [selectedBases, setSelectedBases] = useState(new Set());
    const [selectedToppings, setSelectedToppings] = useState(new Set());
    const [size, setSize] = useState('Normal');
    const [iceLevel, setIceLevel] = useState('NONE');
    const [temperature, setTemperature] = useState('COLD');
    const [sugarAmount, setSugarAmount] = useState(100);

    useEffect(() => {
        fetch('/api/inventory/bases-and-toppings')
            .then(res => res.json())
            .then(data => {
                setBases(data.bases || []);
                setToppings(data.toppings || []);
            });

        fetch(`/api/ingredients/${item.itemId}`)
            .then(res => res.json())
            .then(preChecked => {
                setSelectedBases(new Set(preChecked));
                setSelectedToppings(new Set(preChecked));
            });
    }, [item.itemId]);

    const toggleSet = (set, setSet, id) => {
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSet(newSet);
    };

    const handleAdd = () => {
        if (selectedBases.size === 0) {
            alert('Please select at least one base.');
            return;
        }
        // Logic remains the same...
        const baseObjs = bases.filter(b => selectedBases.has(b.inventoryId));
        const topObjs = toppings.filter(t => selectedToppings.has(t.inventoryId)).slice(0, 5);
        const baseType = baseObjs.map(b => b.name).join(', ');
        const toppingIds = topObjs.map(t => String(t.inventoryId));
        const price = parseFloat(item.basePrice) + (size === 'Large' ? 2 : 0);

        onAdd({
            itemId: item.itemId,
            drinkName: item.name,
            size,
            baseType,
            iceLevel,
            temperature,
            sugarAmount,
            toppings: toppingIds,
            price
        });
    };

    return (
        <div className="cashier-container">
            {}
            <div className="customer-input-section">
                <label>Customer Name:</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                />
            </div>

            {}
            <div className="section-header">Bases and Flavorings</div>
            <div className="options-grid">
                {bases.map(b => (
                    <label key={b.inventoryId} className="option-item">
                        <input
                            type="checkbox"
                            checked={selectedBases.has(b.inventoryId)}
                            onChange={() => toggleSet(selectedBases, setSelectedBases, b.inventoryId)}
                        />
                        {b.name}
                    </label>
                ))}
            </div>

            {}
            <div className="section-header">Toppings (select up to 5)</div>
            <div className="options-grid">
                {toppings.map(t => (
                    <label key={t.inventoryId} className="option-item">
                        <input
                            type="checkbox"
                            checked={selectedToppings.has(t.inventoryId)}
                            onChange={() => toggleSet(selectedToppings, setSelectedToppings, t.inventoryId)}
                        />
                        {t.name}
                    </label>
                ))}
            </div>

            {}
            <div className="section-header">Size</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={size === 'Normal'} onChange={() => setSize('Normal')} /> Regular</label>
                <label className="option-item"><input type="radio" checked={size === 'Large'} onChange={() => setSize('Large')} /> Large (+$2.00)</label>
            </div>

            {}
            <div className="section-header">Ice Level</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={iceLevel === 'NONE'} onChange={() => setIceLevel('NONE')} /> None</label>
                <label className="option-item"><input type="radio" checked={iceLevel === 'LESS'} onChange={() => setIceLevel('LESS')} /> Less</label>
                <label className="option-item"><input type="radio" checked={iceLevel === 'REGULAR'} onChange={() => setIceLevel('REGULAR')} /> Regular</label>
            </div>

            {}
            <div className="section-header">Temperature</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={temperature === 'COLD'} onChange={() => setTemperature('COLD')} /> Cold</label>
                <label className="option-item"><input type="radio" checked={temperature === 'HOT'} onChange={() => setTemperature('HOT')} /> Hot</label>
            </div>

            {}
            <div className="section-header">Sugar Level</div>
            <div className="options-grid">
                {[0, 25, 50, 75, 100].map(s => (
                    <label key={s} className="option-item">
                        <input type="radio" checked={sugarAmount === s} onChange={() => setSugarAmount(s)} />
                        {s}%
                    </label>
                ))}
            </div>

            {/* Footer Buttons */}
            <div className="action-footer">
                <button className="btn-back" onClick={onBack}>← Back</button>
                <button className="btn-add" onClick={handleAdd}>Add to Cart</button>
            </div>
        </div>
    );
}

export default ToggleMenu;
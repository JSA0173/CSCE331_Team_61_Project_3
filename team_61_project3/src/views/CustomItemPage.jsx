import { useState, useEffect } from 'react';
import './ToggleKioskMenu.css';
import './ToggleKioskMenuAlt.css';

function CustomItemPage({ onAdd, setView, altTheme }) {
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
    }, []);

    const toggleSet = (set, setSet, id) => {
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSet(newSet);
    };

    const calculatePrice = () => {
        const basesCost = bases
            .filter(b => selectedBases.has(b.inventoryId))
            .reduce((sum, b) => sum + parseFloat(b.pricePerUnit || 0), 0);
        const toppingsCost = toppings
            .filter(t => selectedToppings.has(t.inventoryId))
            .reduce((sum, t) => sum + parseFloat(t.pricePerUnit || 0), 0);
        const sizeCost = size === 'Large' ? 2 : 0;
        return basesCost + toppingsCost + sizeCost;
    };

    const handleAdd = () => {
        if (selectedBases.size === 0) {
            alert('Please select at least one base.');
            return;
        }

        const baseObjs = bases.filter(b => selectedBases.has(b.inventoryId));
        const topObjs = toppings.filter(t => selectedToppings.has(t.inventoryId)).slice(0, 5);
        const baseType = baseObjs.map(b => b.name).join(', ');
        const toppingIds = topObjs.map(t => String(t.inventoryId));
        const price = calculatePrice();

        onAdd({
            itemId: size === 'Large' ? 56 : 28,
            drinkName: size === 'Large' ? 'Custom Large Tea' : 'Custom Normal Tea',
            size,
            baseType,
            iceLevel,
            temperature,
            sugarAmount,
            toppings: toppingIds,
            price
        });

        setView('home');
    };

    return (
        <div className={altTheme ? "kiosk-toggle-container alt-theme" : "kiosk-toggle-container"}>

            <div className="customer-input-section">
                <label>Current Price:</label>
                <strong style={{ fontSize: '1.2rem' }}>${calculatePrice().toFixed(2)}</strong>
            </div>

            <div className="section-header">Bases and Flavorings</div>
            <div className="options-grid">
                {bases.map(b => (
                    <label key={b.inventoryId} className="option-item">
                        <input
                            type="checkbox"
                            checked={selectedBases.has(b.inventoryId)}
                            onChange={() => toggleSet(selectedBases, setSelectedBases, b.inventoryId)}
                        />
                        {b.name} {b.pricePerUnit ? `(+$${parseFloat(b.pricePerUnit).toFixed(2)})` : ''}
                    </label>
                ))}
            </div>

            <div className="section-header">Toppings (select up to 5)</div>
            <div className="options-grid">
                {toppings.map(t => (
                    <label key={t.inventoryId} className="option-item">
                        <input
                            type="checkbox"
                            checked={selectedToppings.has(t.inventoryId)}
                            onChange={() => toggleSet(selectedToppings, setSelectedToppings, t.inventoryId)}
                        />
                        {t.name} {t.pricePerUnit ? `(+$${parseFloat(t.pricePerUnit).toFixed(2)})` : ''}
                    </label>
                ))}
            </div>

            <div className="section-header">Size</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={size === 'Normal'} onChange={() => setSize('Normal')} /> Regular</label>
                <label className="option-item"><input type="radio" checked={size === 'Large'} onChange={() => setSize('Large')} /> Large (+$2.00)</label>
            </div>

            <div className="section-header">Ice Level</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={iceLevel === 'NONE'} onChange={() => setIceLevel('NONE')} /> None</label>
                <label className="option-item"><input type="radio" checked={iceLevel === 'LESS'} onChange={() => setIceLevel('LESS')} /> Less</label>
                <label className="option-item"><input type="radio" checked={iceLevel === 'REGULAR'} onChange={() => setIceLevel('REGULAR')} /> Regular</label>
            </div>

            <div className="section-header">Temperature</div>
            <div className="options-grid">
                <label className="option-item"><input type="radio" checked={temperature === 'COLD'} onChange={() => setTemperature('COLD')} /> Cold</label>
                <label className="option-item"><input type="radio" checked={temperature === 'HOT'} onChange={() => setTemperature('HOT')} /> Hot</label>
            </div>

            <div className="section-header">Sugar Level</div>
            <div className="options-grid">
                {[0, 25, 50, 75, 100].map(s => (
                    <label key={s} className="option-item">
                        <input type="radio" checked={sugarAmount === s} onChange={() => setSugarAmount(s)} />
                        {s}%
                    </label>
                ))}
            </div>

            <div className="action-footer">
                <button className="btn-back" onClick={() => setView('home')}>← Back</button>
                <button className="btn-add" onClick={handleAdd}>Add to Cart</button>
            </div>

        </div>
    );
}

export default CustomItemPage;
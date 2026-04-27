import { useState, useEffect } from 'react';
import './ToggleKioskMenu.css';

function ToggleKioskMenu({ item, onAdd, onBack, speak = () => {} }) {
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

        speak(`Customizing ${item.name}. Price: $${parseFloat(item.basePrice).toFixed(2)}. Select your bases, toppings, size, ice level, temperature, and sugar level.`);
    }, [item.itemId]);

    const handleBaseToggle = (b) => {
        const newSet = new Set(selectedBases);
        if (newSet.has(b.inventoryId)) {
            newSet.delete(b.inventoryId);
        } else {
            newSet.add(b.inventoryId);
        }
        setSelectedBases(newSet);
    };

    const handleToppingToggle = (t) => {
        const newSet = new Set(selectedToppings);
        if (newSet.has(t.inventoryId)) {
            newSet.delete(t.inventoryId);
        } else if (newSet.size >= 5) {
            speak('Maximum of 5 toppings reached');
            alert('You can only select up to 5 toppings.');
            return;
        } else {
            newSet.add(t.inventoryId);
        }
        setSelectedToppings(newSet);
    };

    const handleSizeChange = (val) => setSize(val);
    const handleIceChange = (val) => setIceLevel(val);
    const handleTemperatureChange = (val) => setTemperature(val);
    const handleSugarChange = (val) => setSugarAmount(val);

    const handleAdd = () => {
        if (selectedBases.size === 0) {
            alert('Please select at least one base.');
            speak('Please select at least one base before adding to cart.');
            return;
        }
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

    const handleBack = () => {
        onBack();
    };

    return (
        <div className="kiosk-toggle-container">

            <div className="kiosk-section-header">Bases and Flavorings</div>
            <div className="options-grid">
                {bases.map(b => (
                    <label 
                        key={b.inventoryId} 
                        className="option-item"
                        onMouseEnter={() => speak(b.name)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedBases.has(b.inventoryId)}
                            onChange={() => handleBaseToggle(b)}
                        />
                        {b.name}
                    </label>
                ))}
            </div>

            <div className="kiosk-section-header">Toppings (select up to 5)</div>
            <div className="options-grid">
                {toppings.map(t => (
                    <label 
                        key={t.inventoryId} 
                        className="option-item"
                        onMouseEnter={() => speak(t.name)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedToppings.has(t.inventoryId)}
                            onChange={() => handleToppingToggle(t)}
                        />
                        {t.name}
                    </label>
                ))}
            </div>

            <div className="kiosk-section-header">Size</div>
            <div className="options-grid">
                <label className="option-item" onMouseEnter={() => speak('Regular size')}>
                    <input type="radio" checked={size === 'Normal'} onChange={() => handleSizeChange('Normal')} /> Regular
                </label>
                <label className="option-item" onMouseEnter={() => speak('Large size, plus $2.00')}>
                    <input type="radio" checked={size === 'Large'} onChange={() => handleSizeChange('Large')} /> Large (+$2.00)
                </label>
            </div>

            <div className="kiosk-section-header">Ice Level</div>
            <div className="options-grid">
                <label className="option-item" onMouseEnter={() => speak('Ice level: none')}>
                    <input type="radio" checked={iceLevel === 'NONE'} onChange={() => handleIceChange('NONE')} /> None
                </label>
                <label className="option-item" onMouseEnter={() => speak('Ice level: less')}>
                    <input type="radio" checked={iceLevel === 'LESS'} onChange={() => handleIceChange('LESS')} /> Less
                </label>
                <label className="option-item" onMouseEnter={() => speak('Ice level: regular')}>
                    <input type="radio" checked={iceLevel === 'REGULAR'} onChange={() => handleIceChange('REGULAR')} /> Regular
                </label>
            </div>

            <div className="kiosk-section-header">Temperature</div>
            <div className="options-grid">
                <label className="option-item" onMouseEnter={() => speak('Temperature: cold')}>
                    <input type="radio" checked={temperature === 'COLD'} onChange={() => handleTemperatureChange('COLD')} /> Cold
                </label>
                <label className="option-item" onMouseEnter={() => speak('Temperature: hot')}>
                    <input type="radio" checked={temperature === 'HOT'} onChange={() => handleTemperatureChange('HOT')} /> Hot
                </label>
            </div>

            <div className="kiosk-section-header">Sugar Level</div>
            <div className="options-grid">
                {[0, 25, 50, 75, 100].map(s => (
                    <label 
                        key={s} 
                        className="option-item"
                        onMouseEnter={() => speak(`Sugar level: ${s} percent`)}
                    >
                        <input type="radio" checked={sugarAmount === s} onChange={() => handleSugarChange(s)} />
                        {s}%
                    </label>
                ))}
            </div>

            <div className="action-footer">
                <button 
                    className="btn-back" 
                    onMouseEnter={() => speak('Going back to menu')}
                    onClick={handleBack}
                >
                    ← Back
                </button>
                <button 
                    className="btn-add" 
                    onMouseEnter={() => speak('Add to Cart')}
                    onClick={handleAdd}
                >
                    Add to Cart
                </button>
            </div>

        </div>
    );
}

export default ToggleKioskMenu;
import { useState, useEffect } from 'react';

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
                setBases(data.bases);
                setToppings(data.toppings);
            });

        fetch(`/api/ingredients/${item.itemId}`)
            .then(res => res.json())
            .then(preChecked => {
                setSelectedBases(new Set(preChecked));
                setSelectedToppings(new Set(preChecked));
            });
    }, [item.itemId]);

    function toggleSet(set, setSet, id) {
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSet(newSet);
    }

    function handleAdd() {
        if (selectedBases.size === 0) {
            alert('Please select at least one base.');
            return;
        }

        const baseObjs = bases.filter(b => selectedBases.has(b.inventoryId));
        const topObjs = toppings.filter(t => selectedToppings.has(t.inventoryId)).slice(0, 5);

        const baseType = baseObjs.map(b => b.name).join(', ');
        const toppingIds = topObjs.map(t => String(t.inventoryId));

        const sizeExtra = size === 'Large' ? 2.00 : 0;
        let baseExtra = 0;
        if (parseFloat(item.basePrice) === 0) {
            baseObjs.forEach(b => baseExtra += parseFloat(b.pricePerUnit || 0));
        }
        let toppingExtra = 0;
        topObjs.forEach(t => toppingExtra += parseFloat(t.pricePerUnit || 0));
        const extras = sizeExtra + baseExtra + toppingExtra;
        const price = parseFloat(item.basePrice) + extras;

        onAdd({
            itemId: item.itemId,
            drinkName: item.name,
            size,
            baseType,
            iceLevel,
            temperature,
            sugarAmount,
            extras,
            toppings: toppingIds,
            price
        });
    }

    return (
        <div style={{ padding: '20px', maxWidth: '700px' }}>
            <h2>Customize: {item.name}</h2>

            <div style={{ marginBottom: '16px' }}>
                <label>Customer Name: </label>
                <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                />
            </div>

            <h3>Bases and Flavorings</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {bases.map(b => (
                    <label key={b.inventoryId}>
                        <input
                            type="checkbox"
                            checked={selectedBases.has(b.inventoryId)}
                            onChange={() => toggleSet(selectedBases, setSelectedBases, b.inventoryId)}
                        />
                        {b.name}
                    </label>
                ))}
            </div>

            <h3>Toppings (max 5)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                {toppings.map(t => (
                    <label key={t.inventoryId}>
                        <input
                            type="checkbox"
                            checked={selectedToppings.has(t.inventoryId)}
                            onChange={() => toggleSet(selectedToppings, setSelectedToppings, t.inventoryId)}
                        />
                        {t.name}
                    </label>
                ))}
            </div>

            <h3>Size</h3>
            <label><input type="radio" checked={size === 'Normal'} onChange={() => setSize('Normal')} /> Regular</label>
            <label><input type="radio" checked={size === 'Large'} onChange={() => setSize('Large')} /> Large (+$2.00)</label>

            <h3>Ice Level</h3>
            <label><input type="radio" checked={iceLevel === 'NONE'} onChange={() => setIceLevel('NONE')} /> None</label>
            <label><input type="radio" checked={iceLevel === 'LESS'} onChange={() => setIceLevel('LESS')} /> Less</label>
            <label><input type="radio" checked={iceLevel === 'REGULAR'} onChange={() => setIceLevel('REGULAR')} /> Regular</label>

            <h3>Temperature</h3>
            <label><input type="radio" checked={temperature === 'COLD'} onChange={() => setTemperature('COLD')} /> Cold</label>
            <label><input type="radio" checked={temperature === 'HOT'} onChange={() => setTemperature('HOT')} /> Hot</label>

            <h3>Sugar Level</h3>
            {[0, 25, 50, 75, 100].map(s => (
                <label key={s}>
                    <input type="radio" checked={sugarAmount === s} onChange={() => setSugarAmount(s)} />
                    {s}%
                </label>
            ))}

            <div style={{ marginTop: '20px' }}>
                <button onClick={onBack}>← Back</button>
                <button onClick={handleAdd} style={{ marginLeft: '10px' }}>Add to Cart</button>
            </div>
        </div>
    );
}

export default ToggleMenu;
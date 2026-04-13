import { useState } from 'react';
import './ItemSettings.css';

const ItemSettings = () => {
  const [customerName, setCustomerName] = useState('');

  const Section = ({ title, extra, children }) => (
    <div className="menu-section">
      <div className="section-header-container">
        <div className="section-title">{title}</div>
        {extra && <span className="section-extra">{extra}</span>}
      </div>
      <div className="options-grid">
        {children}
      </div>
    </div>
  );

  return (
    <div className="pos-container">
      {}
      <div className="customer-input-row">
        <label>Customer Name:</label>
        <input 
          type="text" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
        />
      </div>

      {}
      <div className="form-body">
        <Section title="Bases and Flavorings">
          {["Milk Tea", "Honey", "Coffee", "Thai Milk Tea", "Taro", "Mango", "Coconut", "Tea", "Mango Tea", "Berry", "Peach Tea", "Passion Fruit", "Lemonade", "Strawberry", "Halo Halo", "Wintermelon Tea", "Lemon"].map(item => (
            <label key={item} className="checkbox-item">
              <input type="checkbox" /> <span>{item}</span>
            </label>
          ))}
        </Section>

        <Section title="Toppings" extra="(select up to 5)">
          {["Lychee", "Pearls (Boba)", "Coffee Jelly", "Pudding", "Lychee Jelly", "Honey Jelly", "Crystal Boba", "Mango Popping Boba", "Strawberry Popping Boba", "Ice cream", "Creama", "New inventory item"].map(item => (
            <label key={item} className="checkbox-item">
              <input type="checkbox" /> <span>{item}</span>
            </label>
          ))}
        </Section>

        <Section title="Size">
          <label className="radio-item"><input type="radio" name="size" /> <span>Regular</span></label>
          <label className="radio-item"><input type="radio" name="size" /> <span>Large (+$2.00)</span></label>
        </Section>

        <Section title="Ice Level">
          {["None", "Less", "Regular"].map(level => (
            <label key={level} className="radio-item"><input type="radio" name="ice" /> <span>{level}</span></label>
          ))}
        </Section>

        <Section title="Temperature">
          <label className="radio-item"><input type="radio" name="temp" /> <span>Cold</span></label>
          <label className="radio-item"><input type="radio" name="temp" /> <span>Hot</span></label>
        </Section>

        <Section title="Sugar Level">
          {["0%", "25%", "50%", "75%", "100%"].map(sugar => (
            <label key={sugar} className="radio-item"><input type="radio" name="sugar" /> <span>{sugar}</span></label>
          ))}
        </Section>
      </div>

      {}
      <div className="footer-actions">
        <button className="btn-back">← Back</button>
        <button className="btn-add">Add to Cart</button>
      </div>
    </div>
  );
};

export default ItemSettings;
import './Menu.css';
import bobaImg from '../assets/boba.png'

const MenuView = () => {
  const menuItems = [
    { name: "Classic Pearl Milk Tea", price: 10.30 },
    { name: "Honey Pearl Milk Tea", price: 10.50 },
    { name: "Coffee Creama", price: 11.00 },
    { name: "Coffee Milk Tea w/Coffee Jelly", price: 10.75 },
    { name: "Hokkaido Milk Tea", price: 10.75 },
    { name: "Thai Pearl Milk Tea", price: 10.75 },
    { name: "Taro Pearl Milk Tea", price: 10.75 },
    { name: "Mango Green Milk Tea", price: 11.00 },
    { name: "Coconut Pearl Milk Tea", price: 11.25 },
    { name: "Classic Tea", price: 9.15 },
    { name: "Honey Tea", price: 9.35 },
    { name: "Mango Green Tea", price: 10.30 },
    { name: "Berry Lychee Jelly", price: 10.75 },
    { name: "Peach Tea w/Honey Jelly", price: 10.75 },
    { name: "Mango & Passion Fruit Tea", price: 10.75 },
    { name: "Honey Lemonade", price: 10.75 },
    { name: "Strawberry Coconut", price: 11.00 },
    { name: "Halo Halo", price: 11.45 },
    { name: "Wintermelon Tea", price: 10.30 },
    { name: "Wintermelon Milk Tea", price: 9.70 },
    { name: "Brown Sugar Pearl Milk Tea", price: 11.00 },
    { name: "Brown Sugar Coffee Milk Tea", price: 11.00 },
    { name: "Brown Sugar Hokkaido Milk Tea", price: 11.00 },
    { name: "Brown Sugar Thai Pearl Milk Tea", price: 11.00 },
    { name: "Brown Sugar Taro Pearl Milk Tea", price: 11.00 },
    { name: "Brown Sugar Mango Green Milk Tea", price: 11.00 },
    { name: "Brown Sugar Coconut Pearl Milk Tea", price: 11.00 },
  ];

  const flavorItems = [
    { name: "Honey", price: 1.50 },
    { name: "Mango", price: 1.50 },
    { name: "Coconut", price: 1.50 },
    { name: "Taro", price: 1.50 },
    { name: "Berry", price: 1.50 },
    { name: "Peach Tea", price: 1.50 },
    { name: "Passion Fruit", price: 1.50 },
    { name: "Strawberry", price: 1.50 },
    { name: "Halo Halo", price: 1.50 },
    { name: "Lemon", price: 2.00 },
  ];

const toppingItems = [
    { name: "Lychee", price: 1.25 },
    { name: "Pearls (Boba)", price: 1.25 },
    { name: "Coffee Jelly", price: 1.25 },
    { name: "Pudding", price: 1.25 },
    { name: "Lychee Jelly", price: 1.25 },
    { name: "Honey Jelly", price: 1.25 },
    { name: "Crystal Boba", price: 1.25 },
    { name: "Mango Popping Boba", price: 1.25 },
    { name: "Strawberry Popping Boba", price: 1.25 },
    { name: "Ice cream", price: 1.25 },
    { name: "Creama", price: 1.25 },
  ];

  return (
    <div className="menu-container">
      <header className="menu-header">

        <div className="header-title-group">
          <img 
            src={bobaImg}
            alt="Delicious Boba Tea" 
            className="corner-image" 
          />
          <h1>Menu</h1>
        </div>

      </header>
      
      <main className="menu-grid">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item">
            <span className="menu-item-text">{item.name}</span>
            <span className="menu-item-text">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </main>
      
      <h2 className="section-title">Flavors</h2>
      <div className="menu-grid">
          {flavorItems.map((item, index) => (
              <div key={index} className="menu-item">
                  <span className="menu-item-text">{item.name}</span>
                  <span className="menu-item-text">${item.price.toFixed(2)}</span>
              </div>
          ))}
      </div>

      <h2 className="section-title">Toppings</h2>
      <div className="menu-grid">
          {toppingItems.map((item, index) => (
              <div key={index} className="menu-item">
                  <span className="menu-item-text">{item.name}</span>
                  <span className="menu-item-text">${item.price.toFixed(2)}</span>
              </div>
          ))}
      </div>
      
    </div>
  );
};

export default MenuView;
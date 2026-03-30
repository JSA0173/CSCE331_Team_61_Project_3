import React from 'react';
import './Menu.css';

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
    { name: "Custom Normal Tea", price: 0.00 },
  ];

  return (
  <div className="menu-container">
    <header className="menu-header">
        <img 
            src="src\assets\boba.png"
            alt="Delicious Boba Tea" 
            className="corner-image" 
        />
        <h1>Menu</h1>
    </header>

  <main className="menu-grid">
    {menuItems.map((item, index) => (
      <button key={index} className="menu-button">
        <span className="item-text">{item.name}</span>
        <span className="item-text">${item.price.toFixed(2)}</span>
      </button>
    ))}
  </main>
  
</div>
  );
};

export default MenuView;
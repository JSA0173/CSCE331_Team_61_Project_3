import './Manager.css';
import ProfileIcon from './ProfileIcon'; // 👈 import

function ManagerPortal({ setView, profile }) { // 👈 receive profile
  return (
    <>
      <ProfileIcon profile={profile} setView={setView} /> {/* 👈 add icon */}
      <h1>Manager Portal</h1>
      <div className='toprow'>
        <button id='employeebtn' onClick={() => setView('employee')}>Employees</button>
        <button id='reportbtn' onClick={() => setView('report')}>Reports</button>
      </div>
      <div className='bottomrow'>
        <button id='inventorybtn' onClick={() => setView('inventory')}>Inventory</button>
        <button id='pricebtn' onClick={() => setView('price')}>Prices</button>
      </div>
    </>
  );
}

export default ManagerPortal;
import './ProfileIcon.css';

function ProfileIcon({ profile, setView }) {
  if (!profile) return null; // don't show if not logged in

  return (
    <div className="profileIconWrapper">
      <img
        src={profile.photo}
        alt="Profile"
        className="profileIconImg"
        title={profile.name}
      />
      <div className="profileDropdown">
        <div className="profileDropdownHeader">
          <img src={profile.photo} alt="Profile" className="profileDropdownImg" />
          <div>
            <p className="profileDropdownName">{profile.name}</p>
            <p className="profileDropdownEmail">{profile.email}</p>
          </div>
        </div>
        <hr />
        <button onClick={() => setView('manager')}>Manager Portal</button>
        <button onClick={() => setView('employee')}>Employees</button>
        <button onClick={() => setView('report')}>Reports</button>
        <button onClick={() => setView('inventory')}>Inventory</button>
        <button onClick={() => setView('price')}>Prices</button>
        <hr />
        <button className="logoutBtn" onClick={() => setView('portal')}>Logout</button>
      </div>
    </div>
  );
}

export default ProfileIcon;
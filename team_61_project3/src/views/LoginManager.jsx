import './LoginManager.css';

function LoginManager() {
  const handleManagerLogin = async () => {
    const email = document.querySelector('.Email').value;
    const password = document.querySelector('.Password').value;
    try {
      const response = await fetch('http://localhost:3000/api/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const text = await response.text(); // safer than json()
        throw new Error(text || 'Login failed');
      }

      const data = await response.json();
      console.log('Login success:', data);

    } catch (err) {
      console.error('Error:', err.message);
    }
  };
    return (
        <div className = 'text'>
          <h1>Login</h1>
          <h2>Enter Email and Password below:</h2>
          <div className = 'managerButtons'>
            <input type="text" className="Email" placeholder="Enter Email" />
            <input type="text" className="Password" placeholder="Enter Password" />
          </div>
          <button className="loginButton" onClick={handleManagerLogin}>Login</button>
        </div>
      );
}

export default LoginManager;
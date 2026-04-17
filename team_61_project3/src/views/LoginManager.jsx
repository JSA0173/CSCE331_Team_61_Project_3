import './LoginManager.css';

function LoginManager({ setView }) {
  const handleManagerLogin = async () => {
    const enteredUsername = document.querySelector('.Username').value;
    const enteredPassword = document.querySelector('.Password').value;

    try {
      const response = await fetch('api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: enteredUsername,
          password: enteredPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful');
        setView('manager'); // 👈 switch view after login
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
    return (
        <div class = 'text'>
          <h1>Login</h1>
          <h2>Enter Username and Password below:</h2>
          <div class = 'managerButtons'>
            <input type="text" className="Username" placeholder="Enter Username" />
            <input type="text" className="Password" placeholder="Enter Password" />
          </div>
          <button className="loginButton" onClick={handleManagerLogin}>Login</button>
        </div>
      );
}

export default LoginManager;
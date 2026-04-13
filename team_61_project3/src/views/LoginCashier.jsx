import './LoginCashier.css';

function LoginCashier( {setView}) {
  return (
    <div class = 'text'>
      <h1>Login</h1>
      <h2>Enter Username and Password below:</h2>
      <div class = 'buttons'>
        <input type="text" className="Username" placeholder="Enter Username" />
        <input type="text" className="Password" placeholder="Enter Password" />
      </div>
      
    </div>
  );
}

export default LoginCashier;
import { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import './LoginManager.css';

const GOOGLE_CLIENT_ID = '49759499497-fo4s839uf1qae5ufout3vckre3ql65a9.apps.googleusercontent.com';

function LoginForm() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Standard email/password login ---
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
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      const data = await response.json();
      console.log('Login success:', data);

    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    }
  };

  // --- Google login using OAuth2 token (required for People API) ---
  const googleLogin = useGoogleLogin({
    // Request People API scope for profile + email
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',

    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Call Google People API with the access token
        const res = await fetch(
          'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch profile from People API');

        const personData = await res.json();

        // Extract the relevant fields from the People API response
        setProfile({
          name: personData.names?.[0]?.displayName || 'Unknown',
          email: personData.emailAddresses?.[0]?.value || 'No email',
          photo: personData.photos?.[0]?.url || null,
        });

      } catch (err) {
        console.error('People API error:', err.message);
        setError('Could not fetch Google profile.');
      } finally {
        setLoading(false);
      }
    },

    onError: () => setError('Google Sign-In failed.'),
  });

  // --- Logout / clear profile ---
  const handleLogout = () => setProfile(null);

  return (
    <div className='text'>
      {!profile ? (
        // ── Login Form ──
        <>
          <h1>Login</h1>
          <h2>Enter Email and Password below:</h2>
          <div className='managerButtons'>
            <input type="text" className="Email" placeholder="Enter Email" />
            <input type="password" className="Password" placeholder="Enter Password" />
          </div>
          <button className="loginButton" onClick={handleManagerLogin}>Login</button>

          <div className="divider"><span>or</span></div>

          <button className="googleButton" onClick={() => googleLogin()} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {error && <p className="errorText">{error}</p>}
        </>
      ) : (
        // ── Profile Card (shown after Google login) ──
        <div className="profileCard">
          {profile.photo && (
            <img
              src={profile.photo}
              alt="Profile"
              className="profilePhoto"
            />
          )}
          <h2>Welcome, {profile.name}!</h2>
          <p className="profileEmail">{profile.email}</p>
          <button className="loginButton" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

function LoginManager() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}

export default LoginManager;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || (!password && mode !== 'forgot')) {
      setError('Please fill in required fields.');
      return;
    }
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(res.ok) {
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('email', data.user.email);
          localStorage.setItem('sector', data.user.managed_sector || 'none');
          if (data.user.role === 'user') navigate('/');
          else if (data.user.role === 'superadmin') navigate('/admin');
          else navigate(`/admin/sector/${data.user.managed_sector}`);
        } else {
          setError(data.detail);
        }

      } else if (mode === 'register') {
        const res = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(res.ok) {
          setMessage('Registration successful! Please login.');
          setMode('login');
          setPassword('');
        } else {
          setError(data.detail);
        }

      } else if (mode === 'forgot') {
        const res = await fetch('http://localhost:8000/api/auth/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: password || 'temp' })
        });
        const data = await res.json();
        if(res.ok) {
          setMessage(data.message);
          setMode('login');
          setPassword('');
        } else {
          setError(data.detail);
        }
      }
    } catch (err) {
      setError('Network error contacting server.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', background: '-webkit-linear-gradient(45deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
            CivicResolver
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' && 'Sign in to continue'}
            {mode === 'register' && 'Create your Citizen account'}
            {mode === 'forgot' && 'Reset Password'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '10px', borderRadius: '8px', color: '#fff', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', padding: '10px', borderRadius: '8px', color: '#fff', marginBottom: '20px', fontSize: '0.9rem' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. citizen@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {(mode === 'login' || mode === 'register' || (mode === 'forgot' && !email.includes('admin'))) && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">{mode === 'forgot' ? 'New Password' : 'Password'}</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '15px' }}>
            {mode === 'login' && 'Login'}
            {mode === 'register' && 'Register'}
            {mode === 'forgot' && 'Reset Password'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          {mode !== 'login' && <button className="btn" onClick={() => setMode('login')} style={{ background: 'transparent', padding: 0, textDecoration: 'underline'}}>Back to Login</button>}
          {mode === 'login' && <button className="btn" onClick={() => setMode('register')} style={{ background: 'transparent', padding: 0, textDecoration: 'underline'}}>Create a Citizen Account</button>}
          {mode === 'login' && <button className="btn" onClick={() => setMode('forgot')} style={{ background: 'transparent', padding: 0, color: 'var(--text-muted)'}}>Forgot Password?</button>}
        </div>

      </div>
    </div>
  );
};

export default Login;

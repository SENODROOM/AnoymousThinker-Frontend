import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGrid} />
      <div style={styles.bgGlow} />

      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <h1 style={styles.logoText}>AnonymousThinker</h1>
        </div>
        <p style={styles.subtitle}>Create your mind space</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { label: 'Username', name: 'username', type: 'text', placeholder: 'thinker_42' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name} style={styles.fieldGroup}>
              <label style={styles.label}>{field.label}</label>
              <input
                style={styles.input}
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                autoFocus={field.name === 'username'}
              />
            </div>
          ))}

          <button type="submit" style={{...styles.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p style={styles.switchText}>
          Have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: '100vh', background: '#0a0a0f', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', fontFamily: "'Syne', sans-serif",
  },
  bgGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)`,
    backgroundSize: '40px 40px', pointerEvents: 'none',
  },
  bgGlow: {
    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', background: 'rgba(17,17,24,0.95)',
    border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px',
    padding: '48px 44px', width: '100%', maxWidth: '420px', margin: '16px',
    boxShadow: '0 0 80px rgba(124,58,237,0.08), 0 40px 80px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(20px)', animation: 'fadeIn 0.5s ease',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoIcon: {
    width: 44, height: 44, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', boxShadow: '0 0 20px rgba(124,58,237,0.4)',
  },
  logoText: { fontSize: '1.35rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.02em' },
  subtitle: { color: '#8888a8', fontSize: '0.9rem', marginBottom: 32, marginTop: 4, fontFamily: "'Space Mono', monospace" },
  errorBox: {
    background: 'rgba(240,79,79,0.1)', border: '1px solid rgba(240,79,79,0.3)',
    borderRadius: 10, padding: '12px 16px', color: '#f04f4f',
    fontSize: '0.875rem', marginBottom: 20, fontFamily: "'Space Mono', monospace",
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    fontSize: '0.8rem', fontWeight: 600, color: '#8888a8', letterSpacing: '0.05em',
    textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
  },
  input: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '13px 16px', color: '#e8e8f0', fontSize: '0.95rem',
    fontFamily: "'Syne', sans-serif", outline: 'none', width: '100%',
  },
  btn: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none',
    borderRadius: 10, padding: '14px', color: 'white', fontSize: '0.95rem',
    fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: 'pointer',
    marginTop: 4, boxShadow: '0 4px 20px rgba(124,58,237,0.35)', letterSpacing: '0.02em',
  },
  switchText: { textAlign: 'center', marginTop: 24, color: '#8888a8', fontSize: '0.9rem' },
  link: { color: '#9f67ff', textDecoration: 'none', fontWeight: 600 },
};

// Use same styles
const styles = s;

export default RegisterPage;

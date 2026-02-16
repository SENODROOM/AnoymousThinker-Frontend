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

  const fields = [
    { label: 'Username', name: 'username', type: 'text', placeholder: 'thinker_42' },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
    { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-page__bg-grid" />
      <div className="auth-page__bg-glow" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          <h1 className="auth-logo__name">AnonymousThinker</h1>
        </div>
        <p className="auth-subtitle">Create your mind space</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {fields.map(field => (
            <div key={field.name} className="auth-field">
              <label className="auth-label">{field.label}</label>
              <input
                className="auth-input"
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
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Have an account?{' '}
          <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
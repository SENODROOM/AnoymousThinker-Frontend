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
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
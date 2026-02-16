import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TrainingPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [persona, setPersona] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // simulate save
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="layout-root">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`main${sidebarOpen ? ' main--sidebar-open' : ''}`}>
        {/* Top bar */}
        <div className="topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="topbar__menu-btn" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="topbar__title">Train AI</div>
          <button onClick={() => navigate('/chat')} className="topbar__new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
        </div>

        {/* Content */}
        <div className="training-main">
          <div className="training-header">
            <h1 className="training-title">Train Your AI</h1>
            <p className="training-subtitle">Customize how AnonymousThinker thinks and responds.</p>
          </div>

          {/* System Prompt Card */}
          <div className="training-card">
            <h2 className="training-card__title">
              <div className="training-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              System Prompt
            </h2>
            <textarea
              className="training-textarea"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful, thoughtful AI assistant. You respond with clarity and depth..."
            />
          </div>

          {/* Persona Card */}
          <div className="training-card">
            <h2 className="training-card__title">
              <div className="training-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              AI Persona
            </h2>
            <textarea
              className="training-textarea"
              value={persona}
              onChange={e => setPersona(e.target.value)}
              placeholder="Describe the personality and communication style of your AI..."
            />
          </div>

          <button
            onClick={handleSave}
            className="training-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </>
            )}
          </button>

          {saved && (
            <div className="training-success">
              ✓ Changes saved successfully!
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingPage;
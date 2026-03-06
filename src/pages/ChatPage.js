import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MessageBubble, { TypingIndicator } from '../components/MessageBubble';

const WELCOME_PROMPTS = [
  "How can I help you defend the truth today?",
  "Ready to explore logical proofs and theological depth.",
  "Ask me anything about comparative religion or logic.",
  "Let's reason through the most challenging questions together.",
];

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations, currentConversation, loading, sending, error,
    fetchConversations, createConversation, loadConversation, sendMessage, setError
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [welcomePrompt] = useState(WELCOME_PROMPTS[Math.floor(Math.random() * WELCOME_PROMPTS.length)]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lastIdRef = useRef(id);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (id) loadConversation(id);
  }, [id, loadConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const isSwitching = lastIdRef.current !== id;
      messagesEndRef.current.scrollIntoView({ behavior: isSwitching ? 'auto' : 'smooth' });
      lastIdRef.current = id;
    }
  }, [currentConversation?.messages, id, sending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    setError(null);
    let convId = id;
    if (!convId) {
      const conv = await createConversation();
      if (!conv) return;
      convId = conv._id;
      navigate(`/chat/${convId}`, { replace: true });
      await new Promise(r => setTimeout(r, 100));
    }
    const msg = input.trim();
    setInput('');
    try {
      await sendMessage(convId, msg);
    } catch (err) {
      setInput(msg);
    }
  }, [input, sending, id, createConversation, navigate, sendMessage, setError]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    const conv = await createConversation();
    if (conv) navigate(`/chat/${conv._id}`);
  };

  const handleSuggestion = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const messages = currentConversation?.messages || [];
  const isNewChat = !id || messages.length === 0;

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
          <div className="topbar__title">
            {currentConversation?.title || 'New Chat'}
          </div>
          <button onClick={handleNewChat} className="topbar__new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Messages area */}
        <div className="messages-area">
          {isNewChat ? (
            <div className="welcome">
              <div className="welcome__logo">
                <img src="/logo.png" alt="Logo" />
              </div>
              <h1 className="welcome__title">AnonymousThinker</h1>
              <p className="welcome__subtitle">{welcomePrompt}</p>

              <div className="suggestions">
                {[
                  { icon: '🛡️', text: 'Logically refute the claim that the universe has no beginning', label: 'LOGIC' },
                  { icon: '☪️', text: 'Key theological differences between Islam and Christianity', label: 'COMPARATIVE' },
                  { icon: '📜', text: 'Explain the preservation of the Quranic text recorded in history', label: 'HISTORY' },
                  { icon: '🧠', text: 'Respond to the "Problem of Evil" from an Islamic perspective', label: 'PHILOSOPHY' },
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSuggestion(s.text)} className="suggestion-card">
                    <span className="suggestion-card__icon">{s.icon}</span>
                    <span className="suggestion-card__label">{s.label}</span>
                    <span className="suggestion-card__text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  message={msg}
                  isLast={i === messages.length - 1}
                />
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AnonymousThinker... (Shift+Enter for new line)"
              className="input-textarea"
              rows={1}
              disabled={sending}
            />
            <div className="input-footer">
              <div className="input-footer__left">
                <span className={`input-hint${sending ? ' input-hint--thinking' : ''}`}>
                  {sending ? '● Searching knowledge base & thinking...' : 'Enter to send · Shift+Enter for new line'}
                </span>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="send-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
          <p className="input-disclaimer">
            AnonymousThinker uses your uploaded books for grounded, evidence-based answers.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MessageBubble, { TypingIndicator } from '../components/MessageBubble';

const WELCOME_PROMPTS = [
  "What's on your mind?",
  "Ask me anything — I'm thinking.",
  "Explore an idea with me.",
  "Let's reason through something together.",
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

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load conversation when ID changes
  useEffect(() => {
    if (id) {
      loadConversation(id);
    }
  }, [id, loadConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, sending]);

  // Auto-resize textarea
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

    // Create new conversation if needed
    if (!convId) {
      const conv = await createConversation();
      if (!conv) return;
      convId = conv._id;
      navigate(`/chat/${convId}`, { replace: true });
      // Small delay to ensure navigation completes
      await new Promise(r => setTimeout(r, 100));
    }

    const msg = input.trim();
    setInput('');

    try {
      await sendMessage(convId, msg);
    } catch (err) {
      setInput(msg); // Restore input on error
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
    <div style={styles.root}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main area */}
      <main style={{ ...styles.main, marginLeft: sidebarOpen ? 280 : 0 }}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn} title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div style={styles.topTitle}>
            {currentConversation?.title || 'New Chat'}
          </div>

          <button onClick={handleNewChat} style={styles.newChatTopBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>
        </div>

        {/* Messages area */}
        <div style={styles.messagesArea}>
          {isNewChat ? (
            <div style={styles.welcome}>
              <div style={styles.welcomeLogo}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <h1 style={styles.welcomeTitle}>AnonymousThinker</h1>
              <p style={styles.welcomeSubtitle}>{welcomePrompt}</p>

              <div style={styles.suggestions}>
                {[
                  { icon: '💡', text: 'Explain quantum entanglement simply', label: 'Science' },
                  { icon: '🧠', text: 'What are the most effective study techniques?', label: 'Learning' },
                  { icon: '🚀', text: 'How do I start a tech startup in 2024?', label: 'Business' },
                  { icon: '📝', text: 'Write a haiku about artificial intelligence', label: 'Creative' },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s.text)}
                    style={styles.suggestionCard}
                  >
                    <span style={styles.suggestionIcon}>{s.icon}</span>
                    <span style={styles.suggestionLabel}>{s.label}</span>
                    <span style={styles.suggestionText}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
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

        {/* Error bar */}
        {error && (
          <div style={styles.errorBar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => setError(null)} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* Input area */}
        <div style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AnonymousThinker... (Shift+Enter for new line)"
              style={styles.textarea}
              rows={1}
              disabled={sending}
            />
            <div style={styles.inputFooter}>
              <span style={styles.inputHint}>
                {sending ? (
                  <span style={{ color: '#7c3aed' }}>● Thinking...</span>
                ) : (
                  'Enter to send · Shift+Enter for new line'
                )}
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{
                  ...styles.sendBtn,
                  opacity: (!input.trim() || sending) ? 0.4 : 1,
                  cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
          <p style={styles.disclaimer}>
            AnonymousThinker can make mistakes. Verify important info.
          </p>
        </div>
      </main>
    </div>
  );
};

const styles = {
  root: {
    display: 'flex', height: '100vh', background: '#0a0a0f',
    fontFamily: "'Syne', sans-serif", overflow: 'hidden',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: 0,
  },
  topBar: {
    height: 56, borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', padding: '0 20px',
    gap: 16, background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(10px)',
    flexShrink: 0,
  },
  menuBtn: {
    width: 36, height: 36, background: 'transparent', border: 'none',
    borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#8888a8', transition: 'color 0.2s',
    flexShrink: 0,
  },
  topTitle: {
    flex: 1, fontSize: '0.9rem', fontWeight: 600, color: '#e8e8f0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  newChatTopBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 8, cursor: 'pointer', color: '#9f67ff', fontSize: '0.8rem',
    fontWeight: 600, fontFamily: "'Syne', sans-serif", flexShrink: 0,
  },
  messagesArea: {
    flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
  },
  welcome: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', gap: 24,
    minHeight: '100%',
  },
  welcomeLogo: {
    width: 72, height: 72, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 40px rgba(124,58,237,0.4)', animation: 'fadeIn 0.5s ease',
  },
  welcomeTitle: {
    fontSize: '2.2rem', fontWeight: 800, color: '#e8e8f0',
    letterSpacing: '-0.03em', textAlign: 'center',
    animation: 'fadeIn 0.5s ease 0.1s both',
  },
  welcomeSubtitle: {
    color: '#8888a8', fontSize: '1.05rem',
    fontFamily: "'Space Mono', monospace", textAlign: 'center',
    animation: 'fadeIn 0.5s ease 0.2s both',
  },
  suggestions: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
    maxWidth: 600, width: '100%',
    animation: 'fadeIn 0.5s ease 0.3s both',
  },
  suggestionCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6,
    fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
  },
  suggestionIcon: { fontSize: '1.3rem' },
  suggestionLabel: {
    fontSize: '0.7rem', fontWeight: 600, color: '#7c3aed',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    fontFamily: "'Space Mono', monospace",
  },
  suggestionText: { fontSize: '0.85rem', color: '#c0c0d0', lineHeight: 1.4 },
  messagesList: {
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20,
    maxWidth: 860, margin: '0 auto', width: '100%',
  },
  errorBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(240,79,79,0.1)', border: '1px solid rgba(240,79,79,0.25)',
    borderRadius: 10, padding: '10px 16px', margin: '0 20px 8px',
    color: '#f04f4f', fontSize: '0.85rem', fontFamily: "'Space Mono', monospace",
  },
  errorClose: {
    marginLeft: 'auto', background: 'transparent', border: 'none',
    cursor: 'pointer', color: '#f04f4f', fontSize: '1rem',
  },
  inputArea: {
    padding: '12px 20px 16px', flexShrink: 0,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(10,10,15,0.6)',
  },
  inputWrapper: {
    maxWidth: 860, margin: '0 auto',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 16, overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%', background: 'transparent', border: 'none',
    padding: '16px 20px 8px', color: '#e8e8f0', fontSize: '0.95rem',
    fontFamily: "'Syne', sans-serif", resize: 'none', outline: 'none',
    lineHeight: 1.6, maxHeight: 200, overflowY: 'auto',
  },
  inputFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '6px 12px 10px 20px',
  },
  inputHint: {
    fontSize: '0.72rem', color: '#55556a',
    fontFamily: "'Space Mono', monospace",
  },
  sendBtn: {
    width: 36, height: 36, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'white', transition: 'all 0.2s',
    boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
  },
  disclaimer: {
    textAlign: 'center', marginTop: 10, fontSize: '0.72rem', color: '#55556a',
    fontFamily: "'Space Mono', monospace", maxWidth: 860, margin: '10px auto 0',
  },
};

export default ChatPage;

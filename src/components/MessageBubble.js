import React, { useState } from 'react';

// Simple markdown parser (no dependencies needed for basic rendering)
const parseMarkdown = (text) => {
  if (!text) return '';
  
  // Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => 
    `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`
  );
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Unordered lists
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Paragraphs
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<pre') || p.startsWith('<blockquote')) return p;
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
  
  return html;
};

const MessageBubble = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div style={{
      ...styles.container,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: isLast ? 'fadeIn 0.3s ease' : 'none',
    }}>
      {!isUser && (
        <div style={styles.aiAvatar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          </svg>
        </div>
      )}

      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!isUser && (
          <span style={styles.roleName}>AnonymousThinker</span>
        )}

        <div style={isUser ? styles.userBubble : styles.aiBubble}>
          {isUser ? (
            <p style={{ margin: 0, lineHeight: 1.6 }}>{message.content}</p>
          ) : (
            <div 
              className="message-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}
        </div>

        <div style={{ ...styles.meta, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <span style={styles.timestamp}>{formattedTime}</span>
          {!isUser && (
            <button onClick={handleCopy} style={styles.copyBtn} title="Copy response">
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div style={styles.userAvatar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '4px 0',
  },
  aiAvatar: {
    width: 32, height: 32, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', flexShrink: 0, marginTop: 18, boxShadow: '0 0 12px rgba(124,58,237,0.3)',
  },
  userAvatar: {
    width: 32, height: 32, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#8888a8', flexShrink: 0, marginTop: 18,
  },
  roleName: {
    fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed',
    letterSpacing: '0.03em', fontFamily: "'Space Mono', monospace",
  },
  userBubble: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
    fontFamily: "'Syne', sans-serif",
  },
  aiBubble: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '4px 18px 18px 18px',
    padding: '14px 18px',
    color: '#e8e8f0',
    fontSize: '0.95rem',
    fontFamily: "'Syne', sans-serif",
  },
  meta: {
    display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 4,
  },
  timestamp: {
    fontSize: '0.7rem', color: '#55556a',
    fontFamily: "'Space Mono', monospace",
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'transparent',
    border: 'none', cursor: 'pointer', color: '#55556a', fontSize: '0.7rem',
    fontFamily: "'Space Mono', monospace", padding: '2px 6px', borderRadius: 4,
    transition: 'color 0.2s',
  },
};

// Typing indicator component
export const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0' }}>
    <div style={styles.aiAvatar}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      </svg>
    </div>
    <div>
      <span style={styles.roleName}>AnonymousThinker</span>
      <div style={{ ...styles.aiBubble, display: 'inline-flex', gap: 6, alignItems: 'center', marginTop: 4, padding: '14px 18px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#7c3aed',
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  </div>
);

export default MessageBubble;

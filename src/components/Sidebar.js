import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { conversations, createConversation, deleteConversation, renameConversation, loading } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoverId, setHoverId] = useState(null);

  const handleNewChat = async () => {
    const conv = await createConversation();
    if (conv) navigate(`/chat/${conv._id}`);
  };

  const handleSelect = (conv) => {
    navigate(`/chat/${conv._id}`);
  };

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const saveRename = async (id) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
      if (activeId === id) navigate('/chat');
    }
  };

  const groupByDate = (convs) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const week = new Date(today); week.setDate(today.getDate() - 7);

    const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
    convs.forEach(c => {
      const d = new Date(c.updatedAt || c.createdAt);
      d.setHours(0,0,0,0);
      if (d >= today) groups['Today'].push(c);
      else if (d >= yesterday) groups['Yesterday'].push(c);
      else if (d >= week) groups['This Week'].push(c);
      else groups['Older'].push(c);
    });
    return groups;
  };

  const groups = groupByDate(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div onClick={onToggle} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 40, display: 'none',
          '@media (max-width: 768px)': { display: 'block' }
        }} />
      )}

      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={styles.logoText}>AnonymousThinker</span>
          </div>
          <button onClick={handleNewChat} style={styles.newChatBtn} title="New Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>

        {/* Conversations */}
        <div style={styles.convList}>
          {loading && conversations.length === 0 ? (
            <div style={styles.loadingMsg}>Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div style={styles.emptyMsg}>
              <p>No conversations yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Start a new chat above</p>
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => 
              items.length > 0 && (
                <div key={groupName}>
                  <div style={styles.groupLabel}>{groupName}</div>
                  {items.map(conv => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelect(conv)}
                      onMouseEnter={() => setHoverId(conv._id)}
                      onMouseLeave={() => setHoverId(null)}
                      style={{
                        ...styles.convItem,
                        ...(activeId === conv._id ? styles.convItemActive : {}),
                        ...(hoverId === conv._id && activeId !== conv._id ? styles.convItemHover : {}),
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>

                      {editingId === conv._id ? (
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => saveRename(conv._id)}
                          onKeyDown={e => e.key === 'Enter' && saveRename(conv._id)}
                          onClick={e => e.stopPropagation()}
                          style={styles.editInput}
                          autoFocus
                        />
                      ) : (
                        <span style={styles.convTitle}>{conv.title}</span>
                      )}

                      {(hoverId === conv._id || activeId === conv._id) && editingId !== conv._id && (
                        <div style={styles.convActions} onClick={e => e.stopPropagation()}>
                          <button onClick={(e) => startRename(conv, e)} style={styles.actionBtn} title="Rename">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={(e) => handleDelete(conv._id, e)} style={{...styles.actionBtn, ...styles.deleteBtn}} title="Delete">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={() => navigate('/training')} style={styles.footerBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Train AI
          </button>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <div style={styles.userName}>{user?.username}</div>
            <button onClick={logout} style={styles.logoutBtn} title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    width: 280, height: '100vh', background: '#0e0e18',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, zIndex: 50,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Syne', sans-serif",
  },
  header: {
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 30, height: 30, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', flexShrink: 0,
  },
  logoText: { fontSize: '0.9rem', fontWeight: 700, color: '#e8e8f0', letterSpacing: '-0.01em' },
  newChatBtn: {
    width: 32, height: 32, background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#9f67ff', transition: 'all 0.2s',
    flexShrink: 0,
  },
  convList: { flex: 1, overflowY: 'auto', padding: '8px 8px' },
  loadingMsg: {
    color: '#55556a', textAlign: 'center', padding: '40px 16px',
    fontSize: '0.85rem', fontFamily: "'Space Mono', monospace",
  },
  emptyMsg: {
    color: '#55556a', textAlign: 'center', padding: '40px 16px',
    fontSize: '0.875rem',
  },
  groupLabel: {
    fontSize: '0.7rem', fontWeight: 600, color: '#55556a',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '8px 12px 4px', fontFamily: "'Space Mono', monospace",
  },
  convItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
    transition: 'all 0.15s', position: 'relative', marginBottom: 1,
    color: '#8888a8',
  },
  convItemActive: {
    background: 'rgba(124,58,237,0.12)', color: '#c4a6ff',
    border: '1px solid rgba(124,58,237,0.15)',
  },
  convItemHover: { background: 'rgba(255,255,255,0.04)', color: '#c0c0d0' },
  convTitle: {
    flex: 1, fontSize: '0.875rem', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  convActions: { display: 'flex', gap: 2, flexShrink: 0 },
  actionBtn: {
    width: 24, height: 24, background: 'transparent', border: 'none',
    borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#8888a8', transition: 'color 0.15s',
  },
  deleteBtn: { color: '#f04f4f' },
  editInput: {
    flex: 1, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 4, padding: '2px 6px', color: '#e8e8f0', fontSize: '0.875rem',
    fontFamily: "'Syne', sans-serif", outline: 'none',
  },
  footer: {
    padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  footerBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
    background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 8, cursor: 'pointer', color: '#9f67ff', fontSize: '0.875rem',
    fontWeight: 600, fontFamily: "'Syne', sans-serif', transition: 'all 0.2s",
    width: '100%',
  },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 8px', borderRadius: 8,
  },
  userAvatar: {
    width: 30, height: 30, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
  },
  userName: { flex: 1, fontSize: '0.875rem', color: '#e8e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    width: 28, height: 28, background: 'transparent', border: 'none',
    borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#55556a', flexShrink: 0,
  },
};

export default Sidebar;

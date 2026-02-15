import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrainingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personas');
  const [prompts, setPrompts] = useState([]);
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Persona form
  const [pName, setPName] = useState('');
  const [pPrompt, setPPrompt] = useState('');

  // Example form
  const [ePrompt, setEPrompt] = useState('');
  const [eResponse, setEResponse] = useState('');
  const [eCategory, setECategory] = useState('general');

  useEffect(() => {
    fetchPrompts();
    fetchExamples();
  }, []);

  const fetchPrompts = async () => {
    const res = await axios.get('/api/training/prompts');
    setPrompts(res.data);
  };

  const fetchExamples = async () => {
    const res = await axios.get('/api/training/examples');
    setExamples(res.data);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    if (!pName || !pPrompt) return setError('Name and prompt are required');
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/training/prompts', { name: pName, prompt: pPrompt });
      setPName(''); setPPrompt('');
      fetchPrompts();
      showSuccess('Persona created!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create persona');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePrompt = async (id) => {
    try {
      await axios.put(`/api/training/prompts/${id}/activate`);
      fetchPrompts();
      showSuccess('Persona activated! New chats will use this persona.');
    } catch (err) {
      setError('Failed to activate persona');
    }
  };

  const handleDeletePrompt = async (id) => {
    if (!window.confirm('Delete this persona?')) return;
    await axios.delete(`/api/training/prompts/${id}`);
    fetchPrompts();
  };

  const handleAddExample = async (e) => {
    e.preventDefault();
    if (!ePrompt || !eResponse) return setError('Prompt and response are required');
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/training/examples', {
        prompt: ePrompt, response: eResponse, category: eCategory
      });
      setEPrompt(''); setEResponse('');
      fetchExamples();
      showSuccess('Training example added!');
    } catch (err) {
      setError('Failed to add example');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await axios.get('/api/training/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'training_data.jsonl'; a.click();
      URL.revokeObjectURL(url);
      showSuccess('Training data exported!');
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const tabs = [
    { id: 'personas', label: 'AI Personas', icon: '🧬' },
    { id: 'examples', label: 'Training Examples', icon: '📚' },
    { id: 'guide', label: 'Training Guide', icon: '📖' },
  ];

  return (
    <div style={styles.page}>
      {/* Top nav */}
      <div style={styles.topNav}>
        <button onClick={() => navigate('/chat')} style={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Chat
        </button>
        <h1 style={styles.pageTitle}>
          <span style={{ color: '#7c3aed' }}>★</span> Train AnonymousThinker
        </h1>
        <button onClick={handleExportData} style={styles.exportBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export Data
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.alert('error')}>{error}
          <button onClick={() => setError('')} style={styles.alertClose}>✕</button>
        </div>
      )}
      {success && (
        <div style={styles.alert('success')}>{success}
          <button onClick={() => setSuccess('')} style={styles.alertClose}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {/* === PERSONAS TAB === */}
        {activeTab === 'personas' && (
          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Create AI Persona</h2>
              <p style={styles.cardDesc}>
                Define how AnonymousThinker behaves. Each persona is a system prompt that shapes the AI's personality, tone, and expertise.
              </p>
              <form onSubmit={handleCreatePrompt} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Persona Name</label>
                  <input value={pName} onChange={e => setPName(e.target.value)}
                    placeholder="e.g., Code Expert, Philosopher, Tutor"
                    style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>System Prompt</label>
                  <textarea value={pPrompt} onChange={e => setPPrompt(e.target.value)}
                    placeholder="You are AnonymousThinker, a specialized AI that... Describe the persona's personality, expertise, communication style, and any specific rules."
                    style={{ ...styles.input, minHeight: 160, resize: 'vertical' }}
                    rows={6}
                  />
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating...' : '+ Create Persona'}
                </button>
              </form>

              <div style={styles.presets}>
                <p style={styles.presetsTitle}>Quick Presets:</p>
                {[
                  { name: 'Code Expert', prompt: 'You are AnonymousThinker, an expert software developer with deep knowledge of multiple programming languages, algorithms, and system design. You write clean, efficient code with clear explanations. You always explain your reasoning and suggest best practices. When reviewing code, you identify bugs, security issues, and optimization opportunities.' },
                  { name: 'Socratic Teacher', prompt: 'You are AnonymousThinker, a Socratic teacher who helps people learn through thoughtful questions rather than direct answers. You guide users to discover insights on their own. You are patient, encouraging, and break complex topics into manageable steps. You celebrate intellectual curiosity and reward good reasoning.' },
                  { name: 'Creative Writer', prompt: 'You are AnonymousThinker, a creative writing assistant with a flair for vivid storytelling, poetry, and imaginative prose. You help with brainstorming, character development, plot structuring, and writing in various genres and styles. You are encouraging and help writers find their unique voice.' },
                ].map((preset, i) => (
                  <button key={i} onClick={() => { setPName(preset.name); setPPrompt(preset.prompt); }}
                    style={styles.presetBtn}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Your Personas ({prompts.length})</h2>
              {prompts.length === 0 ? (
                <p style={styles.emptyMsg}>No personas yet. Create one to customize the AI.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {prompts.map(p => (
                    <div key={p._id} style={{
                      ...styles.personaCard,
                      ...(p.isActive ? styles.personaCardActive : {})
                    }}>
                      <div style={styles.personaHeader}>
                        <div>
                          <span style={styles.personaName}>{p.name}</span>
                          {p.isActive && <span style={styles.activeBadge}>ACTIVE</span>}
                        </div>
                        <div style={styles.personaBtns}>
                          {!p.isActive && (
                            <button onClick={() => handleActivatePrompt(p._id)} style={styles.activateBtn}>
                              Activate
                            </button>
                          )}
                          <button onClick={() => handleDeletePrompt(p._id)} style={styles.deleteBtn}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p style={styles.personaPreview}>{p.prompt.substring(0, 120)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === EXAMPLES TAB === */}
        {activeTab === 'examples' && (
          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Add Training Example</h2>
              <p style={styles.cardDesc}>
                Provide example conversations to guide how the AI should respond to specific types of inputs. These are used as few-shot examples.
              </p>
              <form onSubmit={handleAddExample} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select value={eCategory} onChange={e => setECategory(e.target.value)} style={styles.input}>
                    <option value="general">General</option>
                    <option value="coding">Coding</option>
                    <option value="creative">Creative</option>
                    <option value="analysis">Analysis</option>
                    <option value="qa">Q&A</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>User Prompt</label>
                  <textarea value={ePrompt} onChange={e => setEPrompt(e.target.value)}
                    placeholder="What the user might ask..."
                    style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                    rows={3}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Ideal Response</label>
                  <textarea value={eResponse} onChange={e => setEResponse(e.target.value)}
                    placeholder="How AnonymousThinker should ideally respond..."
                    style={{ ...styles.input, minHeight: 120, resize: 'vertical' }}
                    rows={5}
                  />
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Adding...' : '+ Add Example'}
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Training Examples ({examples.length})</h2>
              {examples.length === 0 ? (
                <p style={styles.emptyMsg}>No examples yet. Add some to improve AI responses.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {examples.map(ex => (
                    <div key={ex._id} style={styles.exampleCard}>
                      <div style={styles.exampleHeader}>
                        <span style={styles.exampleCategory}>{ex.category}</span>
                        <button onClick={async () => {
                          await axios.delete(`/api/training/examples/${ex._id}`);
                          fetchExamples();
                        }} style={styles.deleteBtn}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div style={styles.exampleRow}>
                        <span style={styles.exampleRole}>User:</span>
                        <p style={styles.exampleText}>{ex.prompt.substring(0, 80)}{ex.prompt.length > 80 ? '...' : ''}</p>
                      </div>
                      <div style={styles.exampleRow}>
                        <span style={{ ...styles.exampleRole, color: '#7c3aed' }}>AI:</span>
                        <p style={styles.exampleText}>{ex.response.substring(0, 80)}{ex.response.length > 80 ? '...' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === GUIDE TAB === */}
        {activeTab === 'guide' && (
          <div style={styles.guide}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🚀 How to Train AnonymousThinker</h2>
              
              {[
                {
                  step: '01', title: 'Customize with System Prompts (Easiest)',
                  color: '#7c3aed',
                  content: `The simplest way to shape AI behavior is through system prompts (Personas tab). These tell the model how to behave at the start of every conversation.

Write a detailed system prompt that includes:
• Personality traits ("You are helpful, concise, and technical")
• Expertise areas ("You specialize in Python and data science")
• Response format ("Always provide code examples")
• Tone ("Use a friendly but professional tone")
• Rules ("Never provide medical advice")`
                },
                {
                  step: '02', title: 'Fine-Tune on Hugging Face (Real Training)',
                  color: '#22d3a0',
                  content: `For actual model fine-tuning on Hugging Face (FREE tier available):

1. Export your training examples (Export Data button)
2. Go to huggingface.co → AutoTrain
3. Create a new project → Chat/Conversation task
4. Upload your .jsonl file
5. Select a base model (recommended: mistralai/Mistral-7B-Instruct-v0.3)
6. Run fine-tuning (free tier: ~1 hour for small datasets)
7. Copy your new model ID (e.g., yourusername/my-model)
8. Update HUGGINGFACE_MODEL in your .env file`
                },
                {
                  step: '03', title: 'Use Groq for FREE Fast Inference',
                  color: '#f0a84f',
                  content: `Groq offers FREE API access to Llama 3.1 with extremely fast inference:

1. Sign up at groq.com (no credit card needed)
2. Generate an API key
3. Add to your .env: GROQ_API_KEY=gsk_your_key_here
4. The app will automatically use Groq when available
5. Free tier: 14,400 requests/day, 500k tokens/minute

Best free models on Groq:
• llama-3.1-8b-instant (fast, good for most tasks)
• llama-3.1-70b-versatile (smarter, slower)
• mixtral-8x7b-32768 (great for code)`
                },
                {
                  step: '04', title: 'Local Training with Ollama (Advanced)',
                  color: '#f04f4f',
                  content: `Run models completely locally for privacy and unlimited usage:

1. Install Ollama: curl https://ollama.ai/install.sh | sh
2. Pull a model: ollama pull mistral
3. The API runs at localhost:11434
4. Update your aiService.js to use Ollama endpoint
5. No API key needed, runs on your hardware

For custom fine-tuning locally:
• Use Unsloth (unsloth.ai) - 2x faster training
• Install: pip install unsloth
• Load base model → Add your training data → Save LoRA weights
• Export merged model → Upload to HuggingFace`
                }
              ].map(item => (
                <div key={item.step} style={styles.guideStep}>
                  <div style={{ ...styles.stepNum, background: item.color + '22', color: item.color }}>
                    {item.step}
                  </div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>{item.title}</h3>
                    <pre style={styles.stepText}>{item.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Syne', sans-serif",
    color: '#e8e8f0',
  },
  topNav: {
    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: '#0e0e18',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, cursor: 'pointer', color: '#8888a8', fontSize: '0.85rem',
    fontFamily: "'Syne', sans-serif",
  },
  pageTitle: {
    flex: 1, fontSize: '1.2rem', fontWeight: 800, color: '#e8e8f0',
    letterSpacing: '-0.02em',
  },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.2)',
    borderRadius: 8, cursor: 'pointer', color: '#22d3a0', fontSize: '0.85rem',
    fontWeight: 600, fontFamily: "'Syne', sans-serif",
  },
  alert: (type) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 24px', margin: '12px 24px 0',
    background: type === 'error' ? 'rgba(240,79,79,0.1)' : 'rgba(34,211,160,0.1)',
    border: `1px solid ${type === 'error' ? 'rgba(240,79,79,0.25)' : 'rgba(34,211,160,0.25)'}`,
    borderRadius: 10, color: type === 'error' ? '#f04f4f' : '#22d3a0',
    fontSize: '0.875rem', fontFamily: "'Space Mono', monospace",
  }),
  alertClose: {
    marginLeft: 'auto', background: 'transparent', border: 'none',
    cursor: 'pointer', color: 'inherit', fontSize: '1rem',
  },
  tabs: {
    display: 'flex', gap: 4, padding: '16px 24px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  tab: {
    padding: '10px 20px', background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    color: '#8888a8', fontSize: '0.875rem', fontWeight: 600,
    fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
    marginBottom: -1,
  },
  tabActive: { color: '#9f67ff', borderBottomColor: '#7c3aed' },
  content: { padding: '24px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: {
    background: '#0e0e18', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '24px',
  },
  cardTitle: {
    fontSize: '1rem', fontWeight: 700, color: '#e8e8f0',
    marginBottom: 8, letterSpacing: '-0.01em',
  },
  cardDesc: { color: '#8888a8', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: '0.75rem', fontWeight: 600, color: '#8888a8',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    fontFamily: "'Space Mono', monospace",
  },
  input: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: '0.9rem',
    fontFamily: "'Syne', sans-serif", outline: 'none', width: '100%',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none',
    borderRadius: 8, padding: '12px', color: 'white', fontSize: '0.875rem',
    fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
  emptyMsg: { color: '#55556a', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' },
  presets: { marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' },
  presetsTitle: { color: '#8888a8', fontSize: '0.8rem', marginBottom: 10, fontFamily: "'Space Mono', monospace" },
  presetBtn: {
    display: 'inline-block', margin: '0 6px 6px 0', padding: '6px 12px',
    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 6, cursor: 'pointer', color: '#9f67ff', fontSize: '0.8rem',
    fontFamily: "'Space Mono', monospace",
  },
  personaCard: {
    padding: '14px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10,
  },
  personaCardActive: {
    background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
  },
  personaHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  personaName: { fontSize: '0.9rem', fontWeight: 700, color: '#e8e8f0' },
  activeBadge: {
    marginLeft: 8, padding: '2px 8px', background: 'rgba(34,211,160,0.15)',
    border: '1px solid rgba(34,211,160,0.3)', borderRadius: 4,
    color: '#22d3a0', fontSize: '0.65rem', fontFamily: "'Space Mono', monospace",
    letterSpacing: '0.08em',
  },
  personaBtns: { display: 'flex', gap: 8, alignItems: 'center' },
  activateBtn: {
    padding: '4px 10px', background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)', borderRadius: 5,
    cursor: 'pointer', color: '#9f67ff', fontSize: '0.75rem',
    fontFamily: "'Space Mono', monospace",
  },
  deleteBtn: {
    width: 28, height: 28, background: 'rgba(240,79,79,0.1)',
    border: '1px solid rgba(240,79,79,0.2)', borderRadius: 6,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#f04f4f',
  },
  personaPreview: { fontSize: '0.8rem', color: '#8888a8', lineHeight: 1.5, margin: 0 },
  exampleCard: {
    padding: '12px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  exampleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  exampleCategory: {
    fontSize: '0.7rem', fontFamily: "'Space Mono', monospace",
    color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  exampleRow: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  exampleRole: { fontSize: '0.75rem', fontWeight: 700, color: '#8888a8', flexShrink: 0, fontFamily: "'Space Mono', monospace", marginTop: 2 },
  exampleText: { fontSize: '0.85rem', color: '#c0c0d0', margin: 0, lineHeight: 1.5 },
  guide: { maxWidth: 860, margin: '0 auto' },
  guideStep: { display: 'flex', gap: 20, marginBottom: 32 },
  stepNum: {
    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
    fontFamily: "'Space Mono', monospace", flexShrink: 0, letterSpacing: '0.05em',
  },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: '1rem', fontWeight: 700, color: '#e8e8f0', marginBottom: 12 },
  stepText: {
    fontSize: '0.85rem', color: '#8888a8', lineHeight: 1.8, margin: 0,
    fontFamily: "'Space Mono', monospace", whiteSpace: 'pre-wrap',
    background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.05)',
  },
};

export default TrainingPage;

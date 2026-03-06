# 💬 AnonymousThinker Frontend — v2.0

The React frontend for AnonymousThinker — an AI built to defend Islamic truth through logic, historical evidence, and deep scholarly knowledge. Powered by Pinecone semantic search and Groq's `llama-3.3-70b-versatile`.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── MessageBubble.js      # Chat message renderer with markdown + source citations
│   └── Sidebar.js            # Conversation list, navigation, admin button
├── context/
│   ├── AuthContext.js        # Login, register, JWT token management
│   └── ChatContext.js        # Conversations, message sending, state
├── pages/
│   ├── ChatPage.js           # Main chat interface
│   ├── TrainingPage.js       # Admin: persona + knowledge base management
│   ├── LoginPage.js          # Auth
│   └── RegisterPage.js       # Auth
├── utils/
│   └── api.js                # Axios instance with base URL + auth header
└── App.js                    # Routes: public, protected, admin-only
```

---

## ⚙️ Environment Setup

Create a `.env` file in the frontend root:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production (Vercel), set `REACT_APP_API_URL` to your deployed backend URL in Vercel's environment variable settings.

---

## 🚀 Running Locally

```bash
npm install
npm start
```

Runs on `http://localhost:3000`. Make sure the backend is running on port 5000.

---

## 🔐 Authentication & Roles

There are two roles:

| Role    | Access                                              |
| ------- | --------------------------------------------------- |
| `user`  | Chat interface only                                 |
| `admin` | Chat + **Train AI** page (Knowledge Base + Persona) |

To become admin, register an account then run `node scripts/makeAdmin.js your@email.com` in the backend.

---

## 💬 Chat Page

The main interface where users talk to AnonymousThinker.

**What happens when you send a message:**

1. Message is sent to the backend
2. Backend queries Pinecone for the most relevant passages from uploaded books
3. Retrieved knowledge is injected into the AI's context
4. Groq (`llama-3.3-70b`) generates a structured, evidence-based response
5. If sources were used, the response ends with `📚 Sources referenced: [filename]`

**Suggestion cards** on the welcome screen give quick-start prompts across four areas: Logic, Comparative Religion, History, and Philosophy.

---

## 🧠 Train AI Page (Admin Only)

Accessible via the **Train AI** button in the sidebar. Only visible to admin users.

### Pinecone Status Panel

Shows whether Pinecone semantic search is active. Displays:

- Total MongoDB chunks
- Search method (Semantic Vector vs Text Keyword)
- **Re-index All Books** button — use this to push existing books into Pinecone if they were uploaded before Pinecone was configured

### Persona Configuration

- **Designated Persona** — the AI's identity name (e.g. `Intellectual Islamic Defender`)
- **Core Logic & Strategy** — instructions that define how the AI reasons and argues
- Click **Load Default** to load a strong pre-built template
- Click **Commit Changes to Core** to save

### Global Knowledge Base

Upload PDFs or TXT files of Islamic books, comparative religion texts, and philosophical works.

**Each upload automatically:**

1. Extracts text from the PDF
2. Smart-chunks into ~500 word semantic pieces
3. Saves to MongoDB (backup)
4. Vectorizes and indexes into Pinecone

**File badges:**

- `● Pinecone` — indexed and searchable via semantic search
- `○ MongoDB only` — needs re-indexing

**Supported formats:** `.pdf` (text-based), `.txt`

**Arabic/Unicode filenames:** Fully supported — no errors.

---

## 🧩 Key Components

### `MessageBubble.js`

Renders chat messages with full Markdown support:

- Bold, italic, code blocks, headers, lists, blockquotes, links
- Source citation line (`📚 Sources referenced`) rendered with distinct styling
- Copy button on AI responses

### `Sidebar.js`

- Lists all conversations grouped by date (Today, Yesterday, This Week, Older)
- Rename and delete conversations inline
- **Train AI** button visible only to admins
- User avatar and logout

### `ChatContext.js`

Manages all chat state. `sendMessage()` no longer takes a `compare` parameter — comparison mode has been removed entirely.

---

## 🎨 Styling

Global styles live in `public/styles.css` and `src/index.css`.

Design tokens (CSS variables):

```css
--purple-500: #7c3aed /* Primary accent */ --bg-base: #07070e
  /* Deepest background */ --bg-surface: #0e0e1a /* Sidebar, cards */
  --text-primary: #eaeaf6 /* Main text */ --text-accent: #a78bfa
  /* Highlighted text */;
```

Fonts: **Syne** (display) + **Space Mono** (code/meta)

---

## 📦 Dependencies

| Package               | Purpose             |
| --------------------- | ------------------- |
| `react` / `react-dom` | UI framework        |
| `react-router-dom`    | Client-side routing |
| `axios`               | HTTP client         |

---

## 🌐 Deployment (Vercel)

```bash
npm run build
```

Then deploy the `build/` folder to Vercel or Netlify. Set `REACT_APP_API_URL` to your backend URL in the platform's environment variable settings.

---

## 👤 Author

**Muhammad Saad Amin** — explorer of different thoughts with a deep curiosity to learn.

> _"I am AnonymousThinker, an AI to understand different thoughts and to create a conclusion from them."_

# AI Support Chat Agent

Production-ready AI-powered customer support chat widget. Node.js + TypeScript backend, Svelte frontend, SQLite database.

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- API key (choose one):
  - **Google Gemini (FREE)** ⭐ [Get key](https://makersuite.google.com/app/apikey)
  - **Anthropic Claude** [Get key](https://console.anthropic.com)
  - **OpenAI GPT** [Get key](https://platform.openai.com)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: add GEMINI_API_KEY (recommended) OR ANTHROPIC_API_KEY OR OPENAI_API_KEY
npm run seed    # Initialize database
npm run dev     # Runs on http://localhost:3000
```

### Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

Open http://localhost:5173 and start chatting! 🚀

## Features

✅ Real-time AI chat with Google Gemini, Anthropic Claude, or OpenAI GPT
✅ Free tier support (Google Gemini)
✅ Persistent conversation history (SQLite)
✅ Session recovery on page refresh
✅ Beautiful, responsive UI (mobile-friendly)
✅ Modern design with smooth animations
✅ Input validation & error handling
✅ Type-safe with TypeScript
✅ Production-ready code structure

## Tech Stack

**Backend:** Node.js, Express, TypeScript, SQLite, Google Gemini/Anthropic/OpenAI SDK
**Frontend:** Svelte, Vite, TypeScript with modern animations
**Database:** SQLite (zero setup)

## API Endpoints

### POST `/api/chat/message`
Send message, get AI response
```json
Request: { "message": "What's your return policy?", "conversationId": "optional" }
Response: { "conversationId": "uuid", "userMessage": {...}, "aiReply": {...} }
```

### GET `/api/chat/:conversationId`
Get conversation history
```json
Response: { "conversationId": "uuid", "messages": [...] }
```

## Environment Variables

### Backend (`backend/.env`)
```
LLM_PROVIDER=gemini                 # 'gemini' (FREE - default), 'openai', or 'anthropic'
GEMINI_API_KEY=                     # Google Gemini API key (FREE - recommended)
ANTHROPIC_API_KEY=sk-ant-...        # Optional - Anthropic Claude API key
OPENAI_API_KEY=sk-...               # Optional - OpenAI API key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/chat.db
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=TechGear Support
```

## Database Schema

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  sender TEXT CHECK (sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);
```

## Project Structure

```
backend/
├── src/
│   ├── server.ts           # Express setup
│   ├── db/index.ts         # Database layer
│   ├── services/           # Business logic (llm.ts, chat.ts)
│   ├── routes/chat.ts      # API endpoints
│   ├── middleware/         # Error handling
│   └── types/index.ts      # TypeScript types
├── scripts/seed.ts         # DB initialization
└── package.json

frontend/
├── src/
│   ├── App.svelte
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── services/       # API client
│   │   └── stores/         # State management
│   └── app.css
└── package.json
```


## How to Run Locally (Step by Step)

### Step 1: Clone and Navigate
```bash
git clone <repo-url> ai-chat-agent
cd ai-chat-agent
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

### Step 3: Configure Environment Variables
Edit `backend/.env`:
```
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/chat.db
```

Get your API key (choose one):
- **Google Gemini (FREE):** https://makersuite.google.com/app/apikey ⭐ **Recommended** - Free tier, no credit card required
- **Anthropic Claude:** https://console.anthropic.com → API Keys
- **OpenAI GPT:** https://platform.openai.com → API Keys

### Step 4: Initialize Database
```bash
npm run seed
# Output: ✅ Database initialized successfully!
```

### Step 5: Start Backend
```bash
npm run dev
# Output: 🚀 Server running on http://localhost:3000
```

### Step 6: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
# Output: ➜ Local: http://localhost:5173/
```

### Step 7: Open Browser
Visit `http://localhost:5173` and start chatting!

---

## Database Setup & Migrations

### Initial Setup
```bash
cd backend
npm run seed
```

This creates `backend/data/chat.db` with:
- `conversations` table - stores chat sessions
- `messages` table - stores user & AI messages

### Database Schema
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  sender TEXT CHECK (sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
);

CREATE INDEX idx_messages_conversation ON messages(conversationId);
CREATE INDEX idx_messages_created ON messages(createdAt);
```

### Inspect Database
```bash
sqlite3 backend/data/chat.db
> SELECT * FROM messages;
> .schema
> .exit
```

### Reset Database
```bash
rm backend/data/chat.db
npm run seed
```

---

## Architecture Overview

### Backend Structure (Layered Architecture)

**Layer 1: Routes** (`src/routes/chat.ts`)
- HTTP endpoints: POST/GET requests
- Input validation at entry point
- Calls service layer

**Layer 2: Services** (`src/services/`)
- `chat.ts` - Business logic
  - Message validation
  - Conversation management
  - History retrieval
- `llm.ts` - LLM integration
  - Provider abstraction (OpenAI/Anthropic)
  - System prompt management
  - Error handling

**Layer 3: Database** (`src/db/index.ts`)
- SQLite operations
- CRUD functions
- Query optimization with indexes

**Layer 4: Middleware** (`src/middleware/errorHandler.ts`)
- CORS handling
- Error catching
- Async error wrapper

**Layer 5: Types** (`src/types/index.ts`)
- TypeScript interfaces
- Type definitions
- Request/response contracts

### Data Flow
```
User Input
    ↓
Frontend Component (ChatWidget.svelte)
    ↓
API Client (services/api.ts)
    ↓
Backend Routes (POST /api/chat/message)
    ↓
Chat Service (validate input)
    ↓
Database (save user message)
    ↓
LLM Service (generate reply)
    ↓
Database (save AI reply)
    ↓
Response to Frontend
    ↓
Update UI (auto-scroll, show message)
```

### Frontend Structure (Component-Based)

```
App.svelte (Root)
└── ChatWidget.svelte (Main Container)
    ├── Header
    ├── Messages Container
    │   ├── Empty State (initial)
    │   └── Message.svelte (repeating)
    ├── Error Banner
    └── ChatInput.svelte
        ├── Textarea
        └── Send Button

State Management (Svelte Stores)
├── chatStore (main store)
├── messages (derived)
├── loading (derived)
└── error (derived)

Services
└── API Client (api.ts)
    └── HTTP wrapper with error handling
```

---

## Design Decisions

### 1. **Separate Backend & Frontend**
- **Why:** Independent deployment, team separation, different build tools
- **Benefit:** Can scale backend without redeploying frontend

### 2. **Multi-LLM Provider Abstraction**
- **Why:** Interface pattern for Google Gemini, Anthropic, and OpenAI
- **Benefit:** Easy provider switching, no code changes needed, free tier support (Gemini)

### 3. **SQLite for MVP**
- **Why:** Zero setup, file-based, good for single-instance
- **Benefit:** No database server needed, easy local testing
- **Trade-off:** Limited concurrency (fine for demo)

### 4. **System Prompt Over RAG**
- **Why:** Hardcoded knowledge in prompt
- **Benefit:** Simple, works great for small knowledge bases
- **Trade-off:** Knowledge updates require code changes

### 5. **Svelte for Frontend**
- **Why:** Reactive by default, small bundle size, clean syntax, smooth animations
- **Benefit:** Less boilerplate than React, better performance, modern design language
- **Trade-off:** Smaller ecosystem

### 6. **Modern Design Language**
- **Why:** Professional appearance with gradients, animations, and visual hierarchy
- **Benefit:** Premium feel, better user engagement, responsive on all devices
- **Features:** Gradient buttons, spring animations, smooth transitions, Spur AI brand colors

### 7. **Stateless Backend**
- **Why:** Conversation ID = session identifier stored in localStorage + DB
- **Benefit:** Scales horizontally, no server-side sessions
- **Trade-off:** Can't track online status, need client-side session management

### 8. **TypeScript Everywhere**
- **Why:** Type safety at compile time
- **Benefit:** Fewer runtime errors, better IDE support, self-documenting
- **Trade-off:** Longer setup time

---

## LLM Integration

### Supported Providers

#### Google Gemini (FREE - Recommended) ⭐
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key
```
- **Model:** `gemini-2.5-flash-lite`
- **Cost:** Completely FREE (no credit card required)
- **Rate Limits:** 15 RPM, 1,000 daily requests (free tier)
- **Features:** Fast, reliable, 1M context window
- **Get Key:** https://makersuite.google.com/app/apikey

#### Anthropic Claude
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```
- **Model:** `claude-3-5-sonnet-20241022`
- **Max tokens:** 500
- **Temperature:** 0.7
- **Cost:** ~$0.003 per 1K input tokens

#### OpenAI GPT
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```
- **Model:** `gpt-3.5-turbo`
- **Max tokens:** 500
- **Temperature:** 0.7
- **Cost:** ~$0.0005 per 1K input tokens

### System Prompt

The AI is instructed to be a helpful support agent for "TechGear" with knowledge of:

```
**Shipping Policy:**
- Worldwide shipping available
- Standard: 5-7 days, free on $50+
- Express: 1-2 days, $15 flat
- All orders tracked

**Returns:**
- 30-day money-back guarantee
- Unused items in original packaging
- 5-7 day processing
- Free return shipping for defects

**Support Hours:**
- Mon-Fri: 9 AM - 6 PM EST
- Sat: 10 AM - 4 PM EST
- Email: support@techgear.example

**Tone:**
- Warm and professional
- Keep responses under 150 words
- Suggest related products when helpful
```

### How It Works

1. **Context Window:** Includes last 20 messages (limits token usage)
2. **Message History:** Full conversation sent with each request
3. **Error Handling:** If LLM fails, returns friendly fallback message
4. **Token Control:** Max 500 tokens per response to control costs

### Example Interaction

```
User: "Do you ship to USA?"
System Prompt + History → LLM
LLM: "Yes, we ship to the USA! Standard shipping is 5-7 business days 
      and free on orders over $50. We also offer express shipping 
      (1-2 business days) for $15. All orders include tracking."
```

---

## Trade-offs & Future Improvements

### Trade-offs Made (For MVP Speed)

| Decision | Trade-off |
|----------|-----------|
| SQLite | Limited to single instance, no real concurrency |
| No auth | Anyone can access conversations (add JWT later) |
| System prompt knowledge | Hardcoded, requires code change to update FAQs |
| No WebSockets | Polling only, no real-time typing indicators |
| No caching | Every message calls LLM (add Redis later) |
| No tests | Focus on working code (add Vitest later) |
| No analytics | Can't track user behavior (add later) |

### If I Had More Time...

**Short term (1-2 days):**
- [ ] Add unit tests (Vitest)
- [ ] Add input validation tests
- [ ] Implement rate limiting
- [ ] Add message search functionality
- [ ] Implement conversation export (JSON/PDF)
- [ ] Add typing indicators over WebSocket
- [ ] Implement admin dashboard for FAQ updates

**Medium term (1 week):**
- [ ] Switch to PostgreSQL for production
- [ ] Add Redis caching layer
- [ ] Implement JWT authentication
- [ ] Add analytics/metrics
- [ ] Implement conversation tagging
- [ ] Add sentiment analysis
- [ ] Build A/B testing for prompts

**Long term (2+ weeks):**
- [ ] Add multiple LLM providers simultaneously
- [ ] Implement function calling/tools
- [ ] Build agent handoff to human support
- [ ] Add multi-language support
- [ ] Implement WhatsApp/Instagram integration
- [ ] Build Shopify integration
- [ ] Add voice & video support

---

## Common Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot find module | `rm -rf node_modules package-lock.json && npm install` |
| Database locked | Ensure only one backend running (`lsof -i :3000`) |
| API key error | Check `backend/.env`, verify key is correct |
| Network errors | Verify backend/frontend URLs match env vars |
| CORS errors | Check `FRONTEND_URL` in backend `.env` matches frontend URL |
| LLM timeout | Network issue or LLM API overloaded, retry |
| Port already in use | Change PORT in `.env` or kill process on port 3000 |

---

## Deployment

See `DEPLOYMENT.md` for production deployment options:
- **Render** (Backend)
- **Vercel** (Frontend)
- **Railway**
- **Fly.io**

---

## License

MIT

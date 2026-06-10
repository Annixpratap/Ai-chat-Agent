# Quick Start Guide

Get the AI Chat Agent running in 5 minutes.

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **API Key** (choose one):
  - **Google Gemini (FREE - Recommended)** → [Get Key](https://makersuite.google.com/app/apikey) ⭐
  - **Anthropic Claude** → [Get Key](https://console.anthropic.com)
  - **OpenAI** → [Get Key](https://platform.openai.com)

### Get API Key

#### Option 1: Google Gemini (FREE - Recommended) ⭐
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. **No payment method required!**

#### Option 2: Anthropic (Paid)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (free account, add payment method for usage)
3. Go to **API Keys** section
4. Create new key
5. Copy the key (starts with `sk-ant-`)

#### Option 3: OpenAI (Paid)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add payment method
3. Go to **API Keys**
4. Create new key
5. Copy the key (starts with `sk-`)

## Installation (5 steps)

### Step 1: Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

### Step 2: Add API Key

Edit `backend/.env`:

```env
# For Google Gemini (FREE - recommended)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here

# OR for Anthropic
# LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# OR for OpenAI
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Initialize Database

```bash
npm run seed
```

You should see:
```
🌱 Initializing database...
✅ Database initialized successfully!
📍 Database location: ./data/chat.db
```

### Step 4: Start Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📨 LLM Provider: gemini
🔗 CORS enabled for: http://localhost:5173
```

**Keep this terminal running.**

### Step 5: Start Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Test It

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Type a message: "What's your return policy?"
3. Wait for the AI response
4. Refresh the page - conversation history should persist

## Troubleshooting

### Backend won't start

**Error:** `Cannot find module 'express'`
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Error:** `GEMINI_API_KEY environment variable is not set` (or other provider)
- Check `backend/.env` file exists
- Verify API key is correct in `.env`
- Restart backend after editing `.env`

### Frontend won't load

**Error:** `http://localhost:5173 refused to connect`
- Make sure you ran `npm run dev` in `frontend/` folder
- Check you're not on port 5173 already (`lsof -i :5173`)

**Error:** Network errors in console
- Check backend is running on `http://localhost:3000`
- Check `frontend/.env` has correct API URL

### API calls failing

**Error:** `Network error. Backend server may be down.`
- Verify backend is still running
- Check CORS error in browser console
- Restart backend

**Error:** `LLM service not properly configured`
- API key is missing or invalid
- Check `backend/.env` file and ensure LLM_PROVIDER + corresponding API key are set
- For Gemini: https://makersuite.google.com/app/apikey (FREE)
- For Anthropic: https://console.anthropic.com
- For OpenAI: https://platform.openai.com
- Restart backend

**Error:** `Request timeout`
- LLM API might be slow
- Check internet connection
- Try a shorter message

### Database issues

**Error:** `database locked`
- Only run one backend instance
- Restart backend if stuck

**Error:** `Cannot read database`
```bash
cd backend
npm run seed
npm run dev
```

## What's Running

| Component | URL | Port | Purpose |
|-----------|-----|------|---------|
| Backend | http://localhost:3000 | 3000 | API server |
| Frontend | http://localhost:5173 | 5173 | React app |
| Database | ./data/chat.db | - | SQLite |

## Common Commands

```bash
# View backend logs
tail -f backend/data/chat.db  # Database operations

# Inspect database
sqlite3 backend/data/chat.db
> SELECT * FROM messages;

# Stop backend
# Press Ctrl+C in backend terminal

# Stop frontend
# Press Ctrl+C in frontend terminal

# Clear database
rm backend/data/chat.db
npm run seed
```

## Next Steps

1. **Customize the AI:**
   - Edit system prompt in `backend/src/services/llm.ts`
   - Add your store information

2. **Modify UI:**
   - Edit components in `frontend/src/lib/components/`
   - Change colors in `frontend/src/app.css`

3. **Deploy:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for free hosting options

4. **Learn More:**
   - See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
   - See [DEVELOPMENT.md](./DEVELOPMENT.md) for advanced topics

## File Structure

```
backend/
├── src/
│   ├── server.ts          # Main server
│   ├── db/index.ts        # Database
│   ├── services/
│   │   ├── llm.ts         # AI integration
│   │   └── chat.ts        # Chat logic
│   ├── routes/chat.ts     # API endpoints
│   └── middleware/        # Express helpers
├── package.json
└── .env                   # Your API key

frontend/
├── src/
│   ├── App.svelte         # Main app
│   ├── lib/
│   │   ├── components/    # UI components
│   │   ├── services/      # API client
│   │   └── stores/        # State management
│   └── app.css            # Styling
├── package.json
└── index.html             # Entry page
```

## Tips

✅ **Do's:**
- Keep both terminals running during development
- Save files frequently (auto-reload enabled)
- Test in incognito mode to clear cache
- Check browser console for errors

❌ **Don'ts:**
- Don't commit `.env` file (add to .gitignore)
- Don't share your API key
- Don't use `cd` to change directories (use separate terminals)
- Don't run multiple backend instances on same port

## Getting Help

**Check these first:**
1. Backend logs in terminal
2. Browser console (F12)
3. `backend/data/chat.db` - database inspector
4. [DEVELOPMENT.md](./DEVELOPMENT.md) for debugging tips

**Still stuck?**
- Restart both backend and frontend
- Check `.env` files match requirements
- Delete `node_modules` and reinstall (`npm install`)

## What You Can Do Now

- Chat with AI about TechGear products
- Ask about shipping, returns, support
- Ask it anything - it's a general assistant
- Refresh page and see conversation history
- Deploy to production (see DEPLOYMENT.md)

## Example Conversations

**User:** "Do you ship to USA?"
**AI:** "Yes, we ship worldwide with tracking included..."

**User:** "What's your return policy?"
**AI:** "We offer a 30-day money-back guarantee..."

**User:** "Recommend a good phone charger"
**AI:** "Our fast USB-C chargers are popular, starting at $25..."

---

**You're all set!** Open http://localhost:5173 and start chatting. 🚀

# Development Guide

## Project Structure

```
ai-chat-agent/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express app entry
│   │   ├── db/                    # Database layer
│   │   ├── services/              # Business logic
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/            # Express middleware
│   │   └── types/                 # TypeScript types
│   ├── scripts/                   # Utilities (seed.ts)
│   ├── data/                      # SQLite database
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.ts                # Vite entry
│   │   ├── App.svelte             # Root component
│   │   ├── app.css                # Global styles
│   │   ├── lib/
│   │   │   ├── components/        # Svelte components
│   │   │   ├── services/          # API client
│   │   │   ├── stores/            # Svelte stores
│   │   │   └── types.ts           # Type definitions
│   │   └── public/                # Static assets
│   ├── index.html                 # HTML entry
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md                      # Quick start
├── DEPLOYMENT.md                  # Deploy guide
└── .gitignore
```

## Development Workflow

### 1. Initial Setup

```bash
# Clone or initialize
git clone <repo> ai-chat-agent
cd ai-chat-agent

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your API key
npm run seed
npm run dev

# In another terminal, setup frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 2. Making Changes

**Backend Changes:**
- Edit files in `backend/src/`
- Changes auto-reload (ts-node watches files)
- Check console for errors

**Frontend Changes:**
- Edit files in `frontend/src/`
- Vite auto-refreshes in browser
- TypeScript compilation happens in browser

### 3. Adding New Features

#### Adding a Backend Endpoint

1. Create route handler in `backend/src/routes/`
2. Add to service layer in `backend/src/services/`
3. Register in `backend/src/server.ts`

Example:

```typescript
// routes/feedback.ts
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, rating, text } = req.body;
    // Handle feedback
    res.json({ success: true });
  })
);

export default router;
```

Then in `server.ts`:
```typescript
import feedbackRoutes from './routes/feedback.js';
app.use('/api/feedback', feedbackRoutes);
```

#### Adding a Frontend Component

1. Create `.svelte` file in `frontend/src/lib/components/`
2. Import and use in parent component

Example:

```svelte
<!-- src/lib/components/Rating.svelte -->
<script lang="ts">
  export let onRate: (rating: number) => void;
</script>

<div class="rating">
  {#each [1, 2, 3, 4, 5] as star}
    <button on:click={() => onRate(star)}>⭐</button>
  {/each}
</div>

<style>
  .rating {
    display: flex;
    gap: 0.5rem;
  }
</style>
```

#### Adding to Database

1. Update schema in `backend/src/db/index.ts`
2. Add query functions
3. Use in service layer

Example:

```typescript
// db/index.ts
export function addFeedback(conversationId: string, rating: number, text: string) {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO feedback (id, conversationId, rating, text, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, conversationId, rating, text, createdAt);
  return { id, conversationId, rating, text, createdAt };
}
```

## Testing Locally

### Manual Testing

1. **Test Chat Flow:**
   ```
   - Open frontend
   - Type message
   - Verify AI response
   - Check database with sqlite3
   ```

2. **Test Error Cases:**
   ```
   - Empty message
   - Very long message (2000+ chars)
   - Send quickly (rate limiting)
   - Disconnect backend
   - Invalid API key
   ```

3. **Test Persistence:**
   ```
   - Send message
   - Refresh page
   - Verify conversation history loads
   ```

### API Testing with cURL

```bash
# Send message
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your return policy?"}'

# Get conversation
curl http://localhost:3000/api/chat/5d8c7f3e-1a2b-4c5d-9e0f-1a2b3c4d5e6f

# Health check
curl http://localhost:3000/health
```

### Database Inspection

```bash
# Install sqlite3 if needed
# macOS: brew install sqlite3
# Linux: apt-get install sqlite3
# Windows: download from sqlite.org

# Open database
sqlite3 backend/data/chat.db

# Common queries
.tables
SELECT * FROM conversations;
SELECT * FROM messages;
.schema messages
```

## Code Quality

### TypeScript

Run type checking:
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Naming Conventions

- **Variables:** `camelCase` (e.g., `conversationId`, `userMessage`)
- **Functions:** `camelCase` (e.g., `handleChatMessage`, `generateReply`)
- **Classes:** `PascalCase` (e.g., `ApiError`, `ApiClient`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_MESSAGE_LENGTH`)
- **Types:** `PascalCase` (e.g., `Message`, `ChatResponse`)

### Imports

```typescript
// Prefer named imports
import { Router } from 'express';

// Order: built-ins, external, local
import fs from 'fs';
import express from 'express';
import { getDatabase } from '../db/index.js';

// Use .js extensions in ESM
import './services/llm.js';
```

## Debugging

### Backend Debugging

1. **Add Console Logs:**
   ```typescript
   console.log('Sending message:', userMessage);
   console.log('LLM Response:', aiReplyText);
   ```

2. **Check Logs:**
   ```bash
   # Terminal shows all console output
   # Look for errors/warnings
   ```

3. **Database Inspection:**
   ```bash
   sqlite3 backend/data/chat.db ".dump messages"
   ```

### Frontend Debugging

1. **Browser DevTools:**
   - Press F12
   - Check Console tab for errors
   - Network tab shows API requests/responses
   - Application tab shows localStorage

2. **Svelte Stores:**
   ```svelte
   <script>
     import { messages, loading } from './stores/chat';
   </script>

   <pre>{JSON.stringify($messages, null, 2)}</pre>
   ```

3. **Add Component Logging:**
   ```svelte
   <script>
     console.log('Component mounted');
     $: console.log('Messages updated:', $messages);
   </script>
   ```

## Performance Optimization

### Backend

1. **Database Indexes:**
   - Already added for `conversationId` and `createdAt`
   - Add more for frequently filtered columns

2. **Message Limiting:**
   - `MAX_CONTEXT_MESSAGES = 20` limits history sent to LLM
   - Adjust based on token costs

3. **Connection Pooling:**
   - SQLite is single-file
   - Switch to PostgreSQL for true pooling

### Frontend

1. **Svelte Optimization:**
   - Use reactive assignments (`let` with `$:`)
   - Avoid unnecessary re-renders

2. **Bundle Size:**
   - Run `npm run build` and check dist size
   - Vite handles tree-shaking

3. **Network:**
   - API client has 30s timeout
   - Can reduce for faster failures

## Common Issues

### "Cannot find module 'openai'"

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### "Database locked"

```bash
# Only one backend instance should run
# Kill other processes:
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### "CORS errors"

- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches exactly (protocol + domain + port)
- Common mistake: `http://localhost:5173/` vs `http://localhost:5173`

### "API key error"

```bash
# Verify .env file
cat backend/.env

# Test with curl
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### "Svelte type errors"

```bash
cd frontend
npm install  # Ensure all types installed
npm run lint  # Check for errors
```

## Git Workflow

```bash
# Create branch for feature
git checkout -b feature/feedback-system

# Make changes
git add .
git commit -m "Add feedback system"

# Push and create PR
git push origin feature/feedback-system

# After review, merge to main
git checkout main
git pull origin main
git merge feature/feedback-system
git push origin main
```

## Adding Dependencies

### Backend

```bash
cd backend
npm install package-name --save
npm install @types/package-name --save-dev
```

### Frontend

```bash
cd frontend
npm install package-name --save
```

Then commit `package-lock.json`

## Environment Variables

### Backend (.env)

```
# Required
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Optional
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/chat.db
```

### Frontend (.env)

```
# Optional (defaults to localhost:3000)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=TechGear Support
```

## Build & Deploy

### Build Locally

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Test Production Build

```bash
# Backend
cd backend
npm start

# Frontend (separate terminal)
cd frontend
npm run preview
```

## Resources

- [Express.js Docs](https://expressjs.com)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Vite Docs](https://vitejs.dev)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [Anthropic API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)

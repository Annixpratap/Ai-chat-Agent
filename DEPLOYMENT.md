# Deployment Guide

This guide covers deploying the AI Chat Agent to free/affordable platforms.

## Option 1: Render (Recommended - Free Tier)

### Backend Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ai-chat-agent.git
   git push -u origin main
   ```

2. **Create Render Service:**
   - Go to [render.com](https://render.com)
   - Sign up and connect GitHub account
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - **Name:** ai-chat-agent-backend
     - **Environment:** Node
     - **Build Command:** `cd backend && npm install && npm run build`
     - **Start Command:** `cd backend && npm start`
     - **Root Directory:** `backend` (optional, for cleaner logs)

3. **Add Environment Variables:**
   - In Render dashboard, go to Environment
   - Add:
     ```
     LLM_PROVIDER=anthropic
     ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.netlify.app
     ```

4. **Get Backend URL:**
   - Copy the auto-generated URL (e.g., `https://ai-chat-agent.onrender.com`)
   - This will be your `VITE_API_URL`

### Frontend Deployment (Netlify)

1. **Create Netlify Site:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repository

2. **Configure Build:**
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`

3. **Add Environment Variables:**
   - In Netlify dashboard, go to Site settings → Build & deploy → Environment
   - Add:
     ```
     VITE_API_URL=https://ai-chat-agent.onrender.com
     VITE_APP_NAME=TechGear Support
     ```

4. **Deploy:**
   - Push to main branch to trigger auto-deploy
   - Netlify will build and deploy automatically

## Option 2: Vercel (Frontend Only)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure Environment:**
   - In Vercel dashboard, add:
     ```
     VITE_API_URL=https://your-backend.onrender.com
     ```

## Option 3: Railway (Backend & Frontend)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Create Project:**
   ```bash
   railway init
   railway up
   ```

3. **Configure Environment:**
   ```bash
   railway variables set ANTHROPIC_API_KEY sk-ant-xxxxxxxxxxxxx
   railway variables set NODE_ENV production
   ```

4. **View Logs:**
   ```bash
   railway logs
   ```

## Option 4: Fly.io (Production Grade)

1. **Install Fly CLI:**
   - Download from [fly.io](https://fly.io)

2. **Create App:**
   ```bash
   fly apps create ai-chat-backend
   cd backend
   fly launch
   ```

3. **Set Secrets:**
   ```bash
   fly secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   fly secrets set FRONTEND_URL=https://your-frontend.com
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

## Database in Production

### Option A: SQLite (Current Setup)
- ✅ Works with Render/Railway ephemeral filesystems (data persists as volume)
- ⚠️ Limited concurrent connections
- Good for MVP/demo

### Option B: PostgreSQL (Recommended for Scale)

1. **Add Database:**
   - Render: "New +" → "PostgreSQL"
   - Railway: `railway add`

2. **Update Backend:**
   ```bash
   npm install pg --save
   ```

3. **Update Connection in `db/index.ts`:**
   ```typescript
   import pg from 'pg';
   const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
   ```

## Monitoring

### Logs
- **Render:** View in dashboard or `render logs`
- **Netlify:** View in build logs
- **Vercel:** View in deployment logs
- **Fly.io:** `fly logs`

### Error Tracking (Optional)
Add Sentry for error monitoring:

```bash
npm install @sentry/node
```

In `backend/src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Performance Tips

1. **Enable CORS Caching:**
   - Add caching headers for static assets

2. **Database Connection Pooling:**
   - SQLite is fine for demo
   - Switch to PostgreSQL for production

3. **LLM Response Caching:**
   - Cache common questions
   - Redis optional: `npm install redis`

4. **Frontend Optimization:**
   - Vite automatically minifies
   - Consider lazy loading for routes

## Cost Breakdown (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Render | Free (Node) | $0 |
| Netlify | Free (Starter) | $0 |
| OpenAI | Pay-as-you-go | ~$0-20 |
| Anthropic | Pay-as-you-go | ~$0-20 |
| Total | | ~$0-40 |

## Troubleshooting

### 502 Bad Gateway
- Backend crashed or not running
- Check logs: `render logs` / `fly logs`
- Verify API key is set

### CORS Errors
- Check `FRONTEND_URL` env var in backend
- Ensure frontend URL matches exactly

### Database Locked
- SQLite concurrency issue
- Restart service or migrate to PostgreSQL

### Slow API Response
- LLM API rate limiting
- Database query optimization needed
- Consider caching layer

## Scaling Checklist

- [ ] Switch to PostgreSQL
- [ ] Add Redis caching layer
- [ ] Set up error tracking (Sentry)
- [ ] Enable GZIP compression
- [ ] Add rate limiting
- [ ] Implement analytics
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling

## Next Steps

1. Monitor performance in production
2. Gather user feedback
3. Optimize based on usage patterns
4. Plan migration to PostgreSQL if needed
5. Add more LLM features (function calling, etc.)

import dotenv from 'dotenv';
dotenv.config({ override: true });

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import chatRoutes from './routes/chat.js';

const app = express();
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true
  })
);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database
try {
  initializeDatabase();
  console.log('✅ Database initialized');
} catch (error) {
  console.error('❌ Database initialization error:', error);
}

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📨 LLM Provider: ${process.env.LLM_PROVIDER || 'gemini'}`);
  console.log(`🔗 CORS enabled for: ${frontendUrl}`);
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

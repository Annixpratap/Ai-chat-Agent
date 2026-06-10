import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Conversation, Message } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../../');
const dataDir = path.join(projectRoot, 'data');
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'chat.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
    dbInstance.run('PRAGMA journal_mode = WAL');
  }
  return dbInstance;
}

export function initializeDatabase(): void {
  const db = getDatabase();
  
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(createdAt)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updatedAt)`);
  });
}

export function createConversation(): Promise<Conversation> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO conversations (id, createdAt, updatedAt) VALUES (?, ?, ?)`,
      [id, now, now],
      (err) => {
        if (err) reject(err);
        else resolve({ id, createdAt: now, updatedAt: now });
      }
    );
  });
}

export function getConversation(id: string): Promise<Conversation | null> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(
      'SELECT * FROM conversations WHERE id = ?',
      [id],
      (err, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

export function addMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Promise<Message> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    db.run(
      `INSERT INTO messages (id, conversationId, sender, text, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [id, conversationId, sender, text, createdAt],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.run(
          'UPDATE conversations SET updatedAt = ? WHERE id = ?',
          [new Date().toISOString(), conversationId],
          (err) => {
            if (err) reject(err);
            else resolve({ id, conversationId, sender, text, createdAt });
          }
        );
      }
    );
  });
}

export function getConversationMessages(conversationId: string): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(
      `
        SELECT id, conversationId, sender, text, createdAt
        FROM messages 
        WHERE conversationId = ? 
        ORDER BY createdAt ASC
      `,
      [conversationId],
      (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close((err) => {
      if (err) console.error('Error closing database:', err);
      dbInstance = null;
    });
  }
}

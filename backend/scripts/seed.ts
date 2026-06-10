import { initializeDatabase } from '../src/db/index.js';

console.log('🌱 Initializing database...');
initializeDatabase();
console.log('✅ Database initialized successfully!');
console.log('📍 Database location: ./data/chat.db');

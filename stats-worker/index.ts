import { Redis } from 'ioredis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const db = new Database('cards.db');
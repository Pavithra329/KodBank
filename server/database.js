import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'kodbank.db');

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath);

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Koduser (
        uid TEXT PRIMARY KEY,
        uname TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 100000
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS UserToken (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uname TEXT NOT NULL,
        token TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}



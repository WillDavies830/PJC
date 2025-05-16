import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current filename and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create db directory if it doesn't exist
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Create and setup database
const db = new sqlite3.Database(path.join(dbDir, 'race-time.db'));

db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime INTEGER,
      status TEXT DEFAULT 'pending'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raceId INTEGER,
      runnerNumber INTEGER NOT NULL,
      finishTime INTEGER NOT NULL,
      uploadedBy TEXT,
      uploadedAt INTEGER,
      FOREIGN KEY (raceId) REFERENCES races(id)
    )
  `);

  console.log('Database setup complete!');
});

db.close();

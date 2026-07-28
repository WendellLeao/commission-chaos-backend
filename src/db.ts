import Database from "better-sqlite3";
import path from "node:path";

// better-sqlite3 is synchronous: no callbacks, no promises.
// For a small local server like this, sync calls are simpler to read
// and there's no meaningful performance downside at this scale.

// Resolve the path relative to the project root, not the current working directory,
// so it works no matter where you run "npm run dev" / "node dist/server.js" from.
const dbPath = path.join(__dirname, "..", "data", "highscores.db");

// This creates the .db file on disk if it doesn't exist yet.
export const db = new Database(dbPath);

// Recommended pragma for better-sqlite3: enables Write-Ahead Logging.
// This improves concurrent read/write performance and is the standard
// setting used in almost every better-sqlite3 project.
db.pragma("journal_mode = WAL");

// Create the table on startup if it doesn't already exist.
// "IF NOT EXISTS" makes this safe to run every time the server starts.
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerName TEXT NOT NULL,
    score INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

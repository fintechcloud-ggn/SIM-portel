import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Initialize the database connection
const dbPath = path.join(process.cwd(), 'users.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'viewer')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create default admin if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

if (userCount.count === 0) {
  const defaultAdmin = 'admin@example.com';
  const defaultPassword = 'admin'; 
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
  
  const insertUser = db.prepare(`
    INSERT INTO users (email, passwordHash, role)
    VALUES (?, ?, 'admin')
  `);
  
  insertUser.run(defaultAdmin, hashedPassword);
  console.log('Default admin user created successfully.');
}

export default db;

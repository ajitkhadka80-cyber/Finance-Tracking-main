const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'finora.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Create Codes Table
  db.run(`CREATE TABLE IF NOT EXISTS codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_number TEXT UNIQUE,
    description TEXT,
    classification TEXT
  )`);

  // Create Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    last_logged_in TEXT
  )`);

  // Create Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Password reset requests table
  db.run(`CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Scheduled Work Table
  db.run(`CREATE TABLE IF NOT EXISTS scheduled_work (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create Transactions Header Table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT NOT NULL,
    date TEXT NOT NULL,
    final_description TEXT,
    created_by TEXT,
    modified_by TEXT,
    modified_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transaction_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    code_number TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fiscal_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_current BOOLEAN DEFAULT 0
  )`);

  // Seed Admin User (if db is empty)
  db.get("SELECT COUNT(*) AS count FROM users", async (err, row) => {
    if (row && row.count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const stmt = db.prepare("INSERT INTO users (name, email, password, role, last_logged_in) VALUES (?, ?, ?, ?, ?)");
      stmt.run('System Admin', 'admin@finora.io', hashedPassword, 'admin', 'Never');
      stmt.finalize();
      console.log("Seeded default admin user (admin@finora.io)");
    }
  });

  // Seed default Fiscal Year (if empty)
  db.get("SELECT COUNT(*) AS count FROM fiscal_years", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO fiscal_years (name, start_date, end_date, is_current) VALUES (?, ?, ?, ?)",
        ['77/78', '2077-03-01', '2078-02-28', 1]
      );
      console.log("Seeded default fiscal year (77/78)");
    }
  });

  // Seed default Settings (if empty)
  db.get("SELECT COUNT(*) AS count FROM settings", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['org_name', 'FinanceManage']);
      console.log("Seeded default organization name (FinanceManage)");
    }
  });

  // Seed Some Codes (Empty by default per user request, but having 1 or 2 helps with testing if needed. 
  // Wait, user said: "also for code table give just code id code number code desctiption and classification . by default make all transcation 0 dont keep any place holder like total net worth liability in dashboard make it 0 make use table empty jus tadd one admin by default make a setup like if i create the run code in any new laptop if there is no databse then create admin by default".
  // So no codes are seeded by default.
});

module.exports = db;

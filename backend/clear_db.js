const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'finora.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS codes");
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS transactions");
  db.run("DROP TABLE IF EXISTS transaction_lines");
  console.log("Tables dropped");
});

db.close();

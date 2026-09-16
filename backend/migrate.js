const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'finora.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE transactions ADD COLUMN modified_by TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added modified_by");
  });
  db.run("ALTER TABLE transactions ADD COLUMN modified_at TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added modified_at");
  });
});
